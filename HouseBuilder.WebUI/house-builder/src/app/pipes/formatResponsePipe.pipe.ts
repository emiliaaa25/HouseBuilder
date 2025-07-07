import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface DesignSuggestion {
  number: number;
  title: string;
  content: string;
}

@Pipe({
  name: 'formatResponse',
  standalone: true
})
export class FormatResponsePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return this.sanitizer.bypassSecurityTrustHtml('');

    if (value.includes('design-carousel-container')) {
      return this.sanitizer.bypassSecurityTrustHtml(value);
    }

    let formattedValue = value;
    
    const introPattern = /^(.*?)(?=(?:\d+\.|##\s|\*\*\d+\.|Design\s+\d+|Suggestion\s+\d+))/s;
    const introMatch = formattedValue.match(introPattern);
    let intro = '';
    
    if (introMatch && introMatch[1] && introMatch[1].trim().length > 20) {
      intro = introMatch[1].trim();
    }

    let suggestions: DesignSuggestion[] = [];

    const numberedPattern = /(?:^|\n)(\d+)\.\s*([^\n]+)[\s\S]*?(?=(?:\n\d+\.|$))/g;
    let match;
    let potentialSuggestions: DesignSuggestion[] = [];
    
    while ((match = numberedPattern.exec(formattedValue)) !== null) {
      const number = parseInt(match[1]);
      const titleLine = match[2].trim();
      const fullContent = match[0].trim();
      
      if (fullContent.length > 200 && number <= 5) {
        potentialSuggestions.push({
          number: number,
          title: titleLine,
          content: fullContent
        });
      }
    }

    if (potentialSuggestions.length >= 2) {
      suggestions = potentialSuggestions.slice(0, 3); 
    }

    if (suggestions.length === 0) {
      const headerPattern = /(#{2,3})\s*([^\n]+)([\s\S]*?)(?=#{2,3}|$)/g;
      let headerMatch;
      let headerSuggestions: DesignSuggestion[] = [];
      
      while ((headerMatch = headerPattern.exec(formattedValue)) !== null) {
        const title = headerMatch[2].trim();
        const content = headerMatch[3].trim();
        
        if (content.length > 150) {
          headerSuggestions.push({
            number: headerSuggestions.length + 1,
            title: title,
            content: headerMatch[0].trim()
          });
        }
      }
      
      if (headerSuggestions.length >= 2) {
        suggestions = headerSuggestions.slice(0, 3);
      }
    }

    if (suggestions.length === 0) {
      const designPattern = /\*\*(?:Design\s*)?(\d+)[:.]\s*([^*\n]+)\*\*([\s\S]*?)(?=\*\*(?:Design\s*)?\d+[:.]\s*|$)/g;
      let designMatch;
      let designSuggestions: DesignSuggestion[] = [];
      
      while ((designMatch = designPattern.exec(formattedValue)) !== null) {
        const number = parseInt(designMatch[1]);
        const title = designMatch[2].trim();
        const content = designMatch[3].trim();
        
        if (content.length > 100) {
          designSuggestions.push({
            number: number,
            title: title,
            content: designMatch[0].trim()
          });
        }
      }
      
      if (designSuggestions.length >= 2) {
        suggestions = designSuggestions.slice(0, 3);
      }
    }
    if (suggestions.length === 0) {
      const stylePatterns = [
        /(?:Modern|Contemporary|Traditional|Classic|Minimalist|Mediterranean|Farmhouse|Colonial|Victorian|Ranch|Craftsman)[^\n]*(?:Design|Style|House|Concept)[^\n]*/gi,
        /(?:Design|Style|Option|Suggestion)\s*[A-Z][^\n]*/g
      ];
      
      let foundStyles: Array<{title: string, position: number}> = [];
      stylePatterns.forEach(pattern => {
        let styleMatch;
        while ((styleMatch = pattern.exec(formattedValue)) !== null) {
          foundStyles.push({
            title: styleMatch[0].trim(),
            position: styleMatch.index
          });
        }
      });
      
      if (foundStyles.length >= 2) {
        foundStyles.sort((a, b) => a.position - b.position);
        
        for (let i = 0; i < Math.min(3, foundStyles.length); i++) {
          const currentStyle = foundStyles[i];
          const nextStyle = foundStyles[i + 1];
          
          const startPos = Math.max(0, currentStyle.position - 100);
          const endPos = nextStyle ? nextStyle.position : formattedValue.length;
          
          const sectionContent = formattedValue.substring(startPos, endPos).trim();
          
          if (sectionContent.length > 200) {
            suggestions.push({
              number: i + 1,
              title: currentStyle.title,
              content: sectionContent
            });
          }
        }
      }
    }

    if (suggestions.length === 0 && formattedValue.length > 1000) {
      const sentences = formattedValue.split(/[.!?]+\s+/);
      const chunkSize = Math.ceil(sentences.length / 3);
      
      for (let i = 0; i < 3; i++) {
        const start = i * chunkSize;
        const end = Math.min((i + 1) * chunkSize, sentences.length);
        const chunk = sentences.slice(start, end).join('. ');
        
        if (chunk.length > 200) {
          const firstLine = chunk.split('\n')[0];
          const title = firstLine.length > 50 ? `Design Suggestion ${i + 1}` : firstLine;
          
          suggestions.push({
            number: i + 1,
            title: title,
            content: chunk
          });
        }
      }
    }

    if (suggestions.length >= 2) {
      suggestions = suggestions.filter(s => s.content.length > 100);
      suggestions = suggestions.slice(0, 3);
      const carouselHtml = this.createCarousel(intro, suggestions);
      return this.sanitizer.bypassSecurityTrustHtml(carouselHtml);
    }
    const simpleFormatted = `
      <div class="response-content-wrapper">
        <div class="simple-response">
          ${this.formatSimpleContent(value)}
        </div>
      </div>
    `;
    
    return this.sanitizer.bypassSecurityTrustHtml(simpleFormatted);
  }

  private createCarousel(intro: string, suggestions: DesignSuggestion[]): string {
    const totalSuggestions = suggestions.length;
    
    let carouselHtml = `
      <div class="design-carousel-container">
        <!-- Introduction Card -->
        <div class="carousel-intro-card">
          <div class="intro-header">
            <h3 class="intro-title">Your Personalized House Design Suggestions</h3>
           
          </div>
          <div class="intro-content">
            <p>${this.formatSimpleContent(intro)}</p>
          </div>
        </div>

        <!-- Carousel Controls -->
        <div class="carousel-navigation">
         
        <!-- Suggestions Slider -->
        <div class="carousel-slider">
          <div class="suggestions-track" id="suggestionsTrack">
    `;

    suggestions.forEach((suggestion, index) => {
      carouselHtml += `
        <div class="suggestion-slide" data-slide="${index}">
          <div class="suggestion-card">
            <div class="suggestion-header">
              <div class="suggestion-badge">Design ${suggestion.number}</div>
              <h3 class="suggestion-title">${suggestion.title}</h3>
            </div>
            
            <div class="suggestion-content">
              ${this.formatSuggestionContent(suggestion.content)}
            </div>
          </div>
        </div>
      `;
    });

    carouselHtml += `
          </div>
        </div>
      </div>
    `;

    return carouselHtml;
  }

  private formatSuggestionContent(content: string): string {
    content = content.trim();
    content = content.replace(/^(?:\d+\.\s*)?[^\n]+\n/, '');
    content = content.replace(/\*\*+([^*]+?)\*\*+/g, '<h4 class="detail-title">$1</h4>');
    
    const numberedSections = content.split(/(?=\d+\.\s+[A-Z])/);
    let formattedContent = '';
    
    numberedSections.forEach((section, index) => {
      if (section.trim()) {
        const titleMatch = section.match(/^\d+\.\s+([^:\n]+)[:.]?\s*(.*)/s);
        
        if (titleMatch) {
          const title = titleMatch[1].trim();
          const sectionContent = titleMatch[2].trim();
          
          formattedContent += `
            <div class="detail-section">
              <h4 class="detail-title">${title}</h4>
              <div class="detail-content">
                ${this.formatDetailText(sectionContent)}
              </div>
            </div>
          `;
        } else {
          formattedContent += `
            <div class="detail-section">
              <div class="detail-content">
                ${this.formatDetailText(section)}
              </div>
            </div>
          `;
        }
      }
    });
    if (!formattedContent.trim()) {
      formattedContent = `
        <div class="detail-section">
          <div class="detail-content">
            ${this.formatDetailText(content)}
          </div>
        </div>
      `;
    }
    
    return formattedContent;
  }

  private formatDetailText(text: string): string {
    text = text.trim();
    
    text = text.replace(/\*\*+/g, '**');
    text = text.replace(/^(\d+)\.\s+([^:\n]+)[:.]?\s*/gm, '<h4 class="detail-title">$2</h4>');
    
    text = text.replace(/^\s*[-•*]\s+(.+)$/gm, '<li>$1</li>');
    
    text = text.replace(/(<li>.*<\/li>)(\s*<li>.*<\/li>)*/gs, '<ul>$&</ul>');
    
    text = text.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/(?<!\*)\*(?!\*)/g, '');
    text = text.replace(/\n\s*\n/g, '</p><p>');
    
    text = text.replace(/^\*+\s*/gm, '');
    text = text.replace(/\s*\*+$/gm, '');
    
    if (text && !text.startsWith('<ul>') && !text.startsWith('<p>') && !text.startsWith('<h4>') && !text.startsWith('<li>')) {
      text = `<p>${text}</p>`;
    }
    
    return text;
  }

  private formatSimpleContent(text: string): string {
    text = text.replace(/\*\*+/g, '**');
    text = text.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/(?<!\*)\*(?!\*)/g, '');
    text = text.replace(/^\s*[-•*]\s+(.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)(\s*<li>.*<\/li>)*/gs, '<ul>$&</ul>');
    
    text = text.replace(/\n\s*\n/g, '</p><p>');
    text = text.replace(/^\*+\s*/gm, '');
    text = text.replace(/\s*\*+$/gm, '');
    
    if (text && !text.startsWith('<ul>') && !text.startsWith('<p>')) {
      text = `<p>${text}</p>`;
    }
    
    return text;
  }
}