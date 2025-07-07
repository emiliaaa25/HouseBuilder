import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GeminiService, ExteriorDesignRequest } from '../../services/gemini.service';
import { HouseSpecifications, HouseShapeType } from '../../models/houseSpecifications.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormatResponsePipe } from "../../pipes/formatResponsePipe.pipe";
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-gemini-house-suggestions',
  templateUrl: './gemini-house-suggestions.component.html',
  styleUrls: ['./gemini-house-suggestions.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormatResponsePipe,
    NavbarComponent
],
})
export class GeminiHouseSuggestionsComponent implements OnInit, AfterViewInit {
  @Input() currentHouseSpecs: HouseSpecifications | null = null;
  @Output() houseSuggestionSelected = new EventEmitter<HouseSpecifications>();
  @ViewChild('responseContent', { static: false }) responseContent!: ElementRef;
  
  structuredForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  geminiResponse: string = '';
  private currentSlide = 0;
  private totalSlides = 0;
  private carouselInitialized = false;
  houseShapeOptions = [
    { value: 'LShape', label: 'L-shaped' },
    { value: 'Rectangular', label: 'Rectangular' },
    { value: 'Square', label: 'Square' },
    { value: 'TShape', label: 'T-shaped' },
    { value: 'UShape', label: 'U-shaped' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private geminiService: GeminiService,
    private cdr: ChangeDetectorRef
  ) {
    this.structuredForm = this.fb.group({
      landSize: ['10', [Validators.required, Validators.min(1)]],
      houseShape: ['LShape', Validators.required],
      budget: [''],
      familySize: [''],
      additionalRequirements: ['']
    });
  }
  
  ngOnInit(): void {
    if (this.currentHouseSpecs && this.currentHouseSpecs.shapeType !== undefined) {
      this.structuredForm.patchValue({
        houseShape: this.getShapeTypeString(this.currentHouseSpecs.shapeType)
      });
    }
  }

  ngAfterViewInit(): void {
    if (this.geminiResponse) {
      this.initializeCarouselIfNeeded();
    }
  }
  getShapeTypeString(shapeType: HouseShapeType | undefined): string {
    if (shapeType === undefined) return 'Rectangular';
    
    switch (shapeType) {
      case HouseShapeType.Rectangular: return 'Rectangular';
      case HouseShapeType.Square: return 'Square';
      case HouseShapeType.LShape: return 'LShape';
      case HouseShapeType.TShape: return 'TShape';
      case HouseShapeType.UShape: return 'UShape';
      default: return 'Rectangular';
    }
  }
  
  submitPrompt(): void {
    if (this.structuredForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    this.geminiResponse = '';
    this.carouselInitialized = false;
    this.generateExteriorDesign();
  }
  
  private generateExteriorDesign(): void {
    const formValues = this.structuredForm.value;
    const request: ExteriorDesignRequest = {
      LandSize: formValues.landSize,
      HouseShape: formValues.houseShape,
      Budget: formValues.budget,
      FamilySize: formValues.familySize,
      AdditionalRequirements: formValues.additionalRequirements
    };
    
    this.geminiService.generateExteriorDesign(request).subscribe({
      next: (response) => {
        this.geminiResponse = response.response;
        this.isLoading = false;
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.initializeCarouselIfNeeded();
          this.scrollToResponse();
        }, 250);
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  private initializeCarouselIfNeeded(): void {
    if (this.carouselInitialized) return;

    const carouselContainer = document.querySelector('.design-carousel-container');
    if (!carouselContainer) {
      setTimeout(() => this.initializeCarouselIfNeeded(), 100);
      return;
    }

    const track = document.getElementById('suggestionsTrack') as HTMLElement;
    const currentSlideSpan = document.getElementById('currentSlide') as HTMLElement;
    const prevBtn = document.getElementById('prevBtn') as HTMLButtonElement;
    const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement;

    if (!track || !currentSlideSpan || !prevBtn || !nextBtn) {
      setTimeout(() => this.initializeCarouselIfNeeded(), 100);
      return;
    }
    const slides = track.querySelectorAll('.suggestion-slide');
    this.totalSlides = slides.length;
    this.currentSlide = 0;

    const updateCarousel = () => {
      if (track && currentSlideSpan && prevBtn && nextBtn) {
        track.style.transform = `translateX(-${this.currentSlide * 100}%)`;
        currentSlideSpan.textContent = (this.currentSlide + 1).toString();
        
        prevBtn.disabled = this.currentSlide === 0;
        nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
        if (this.currentSlide === 0) {
          prevBtn.classList.add('disabled');
        } else {
          prevBtn.classList.remove('disabled');
        }
        
        if (this.currentSlide === this.totalSlides - 1) {
          nextBtn.classList.add('disabled');
        } else {
          nextBtn.classList.remove('disabled');
        }
      }
    };

    const handlePrevClick = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.currentSlide > 0) {
        this.currentSlide--;
        updateCarousel();
      }
    };

    const handleNextClick = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.currentSlide < this.totalSlides - 1) {
        this.currentSlide++;
        updateCarousel();
      }
    };

    prevBtn.removeEventListener('click', handlePrevClick);
    nextBtn.removeEventListener('click', handleNextClick);

    prevBtn.addEventListener('click', handlePrevClick);
    nextBtn.addEventListener('click', handleNextClick);

    updateCarousel();
    this.carouselInitialized = true;
  }

  private scrollToResponse(): void {
    setTimeout(() => {
      const responseElement = document.querySelector('.response-card');
      if (responseElement) {
        responseElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  }
  
  private handleError(error: any): void {
    console.error('Error:', error);
    this.errorMessage = error.message || 'An error occurred while generating suggestions.';
    this.isLoading = false;
  }
  
  clearResponse(): void {
    this.geminiResponse = '';
    this.carouselInitialized = false;
    this.currentSlide = 0;
    this.totalSlides = 0;
  }
}