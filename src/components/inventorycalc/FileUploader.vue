<template>
  <div 
    class="file-uploader"
    :class="{ 'is-dragging': isDragging, 'has-error': error }"
    @click="triggerFileInput"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <input
      ref="fileInput"
      type="file"
      accept=".xlsx,.xls"
      @change="handleFileChange"
      class="file-input-hidden"
    />
    
    <div class="upload-content">
      <!-- Icon -->
      <div class="upload-icon">{{ icon }}</div>
      
      <!-- Title -->
      <div class="upload-title">{{ title }}</div>
      
      <!-- Description -->
      <p class="upload-description">
        Click hoặc kéo thả file vào đây
      </p>
      
      <!-- File name (when loaded) -->
      <div v-if="fileName" class="file-name">
        <span class="success-icon">✓</span>
        {{ fileName }}
      </div>
      
      <!-- Loading state -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p class="loading-text">Đang đọc file...</p>
      </div>
      
      <!-- Error state -->
      <div v-if="error" class="error-message">
        <span class="error-icon">❌</span>
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  title: string;
  icon: string;
  isLoading?: boolean;
  error?: string | null;
}

interface Emits {
  (e: 'file-selected', file: File): void;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null,
});

const emit = defineEmits<Emits>();

const fileInput = ref<HTMLInputElement | null>(null);
const fileName = ref('');
const isDragging = ref(false);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    processFile(file);
  }
};

const handleDragOver = () => {
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  const file = event.dataTransfer?.files[0];
  if (file) {
    processFile(file);
  }
};

const processFile = (file: File) => {
  fileName.value = file.name;
  emit('file-selected', file);
};
</script>

<style scoped>
.file-uploader {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  border: 2px dashed #d1d5db;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.file-uploader:hover {
  border-color: #667eea;
  background: #f9fafb;
}

.file-uploader.is-dragging {
  border-color: #667eea;
  background: #eef2ff;
  transform: scale(1.02);
}

.file-uploader.has-error {
  border-color: #ef4444;
}

.file-input-hidden {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  font-size: 4rem;
  margin-bottom: 0.5rem;
}

.upload-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.25rem;
}

.upload-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.file-name {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #d1fae5;
  border-radius: 0.375rem;
  color: #065f46;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.success-icon {
  color: #10b981;
  font-weight: bold;
}

.loading-state {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #fee2e2;
  border-radius: 0.375rem;
  color: #991b1b;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-icon {
  flex-shrink: 0;
}
</style>