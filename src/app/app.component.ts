import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  BikeRepairApiService,
  ChatResponse
} from './services/bike-repair-api.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  @ViewChild('chatEnd') chatEnd?: ElementRef<HTMLDivElement>;

  question = '';
  selectedFile: File | null = null;
  messages: ChatMessage[] = [
    {
      role: 'assistant',
      content: 'Hello! I am BikeRepairAI. Ask me about bicycle repairs or upload a repair manual to get started.'
    }
  ];

  isLoading = false;
  isUploading = false;
  uploadMessage = '';
  uploadError = '';

  readonly suggestions = [
    'What should I inspect if braking power is weak?',
    'How do I fix a flat bicycle tire?',
    'Why does my bicycle chain keep slipping?'
  ];

  constructor(private api: BikeRepairApiService) {}

  sendQuestion(value?: string): void {
    const text = (value ?? this.question).trim();

    if (!text || this.isLoading) {
      return;
    }

    this.messages.push({ role: 'user', content: text });
    this.question = '';
    this.isLoading = true;

    this.api.askQuestion(text).subscribe({
      next: (response: ChatResponse) => {
        this.messages.push({
          role: 'assistant',
          content: response.answer || 'No answer was returned.'
        });
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Chat API error:', error);

        this.messages.push({
          role: 'assistant',
          content: this.getErrorMessage(
            error,
            'Sorry, I could not connect to the repair service.'
          )
        });

        this.isLoading = false;
        this.scrollToBottom();
      }
    });

    this.scrollToBottom();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.uploadMessage = '';
    this.uploadError = '';
    this.selectedFile = null;

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      this.uploadError = 'Please select a PDF file.';
      input.value = '';
      return;
    }

    this.selectedFile = file;
  }

  uploadPdf(): void {
    if (!this.selectedFile || this.isUploading) {
      return;
    }

    this.isUploading = true;
    this.uploadMessage = '';
    this.uploadError = '';

    this.api.uploadPdf(this.selectedFile).subscribe({
      next: (response) => {
        this.uploadMessage =
          this.getSuccessMessage(response);

        this.isUploading = false;
        this.selectedFile = null;
      },
      error: (error) => {
        console.error('PDF upload error:', error);

        this.uploadError = this.getErrorMessage(
          error,
          'PDF upload failed. Please try again.'
        );

        this.isUploading = false;
      }
    });
  }

  private getSuccessMessage(response: unknown): string {
    if (
      response &&
      typeof response === 'object' &&
      'message' in response &&
      typeof response.message === 'string'
    ) {
      return response.message;
    }

    return 'Upload request completed successfully. You can now ask questions about the document.';
  }

  private getErrorMessage(
    error: any,
    fallback: string
  ): string {
    if (typeof error?.error === 'string') {
      return error.error;
    }

    return error?.error?.message
      ?? error?.error?.title
      ?? fallback;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.chatEnd?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }, 0);
  }
}