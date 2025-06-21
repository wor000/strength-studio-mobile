import { extractWorkoutInfoFromFile, generatePromptFromFileInfo } from '@/utils/aiWorkoutConverter';

export interface FileUploadResult {
  success: boolean;
  content?: string;
  error?: string;
  fileName?: string;
  fileType?: string;
}

export const processTextFile = async (file: File): Promise<FileUploadResult> => {
  try {
    const text = await file.text();
    return {
      success: true,
      content: text,
      fileName: file.name,
      fileType: 'text'
    };
  } catch (error) {
    console.error('Erro ao processar arquivo TXT:', error);
    return {
      success: false,
      error: 'Erro ao ler arquivo de texto'
    };
  }
};

// PDF removido para reduzir egress - apenas TXT suportado
export const processPDFFile = async (file: File): Promise<FileUploadResult> => {
  return {
    success: false,
    error: 'Processamento de PDF temporariamente desabilitado para otimização. Use arquivos TXT.'
  };
};

export const processUploadedFile = async (file: File): Promise<FileUploadResult> => {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  console.log('🔍 Processando arquivo:', file.name, 'Tipo:', fileType);
  
  // Verificar tamanho do arquivo (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return {
      success: false,
      error: 'Arquivo muito grande. Máximo permitido: 5MB'
    };
  }
  
  // Apenas TXT suportado para otimização
  if (fileType.includes('text') || fileName.endsWith('.txt')) {
    return await processTextFile(file);
  } else if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
    return await processPDFFile(file);
  } else {
    return {
      success: false,
      error: 'Tipo de arquivo não suportado. Use apenas arquivos .txt'
    };
  }
};

export const formatFileContentForAI = (result: FileUploadResult): string => {
  if (!result.success || !result.content) {
    return '';
  }

  // Extrair informações do treino do conteúdo
  const workoutInfo = extractWorkoutInfoFromFile(result.content);
  
  // Gerar prompt formatado com o conteúdo original
  return generatePromptFromFileInfo(workoutInfo, result.content);
}; 