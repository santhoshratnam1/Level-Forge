import { useState, useCallback } from 'react';
import type { Annotation, AnnotationTool, Point } from '../types/portfolio';
import { IconName } from '../components/Icon';

export const useAnnotations = () => {
  const [annotations, setAnnotations] = useState<Record<number, Annotation[]>>({});
  const [activeTool, setActiveTool] = useState<IconName>('arrow');

  const addAnnotation = useCallback((imageIndex: number, newAnnotations: Annotation[]) => {
    setAnnotations(prev => ({
      ...prev,
      [imageIndex]: newAnnotations,
    }));
  }, []);

  const undoAnnotation = useCallback((imageIndex: number) => {
    setAnnotations(prev => {
      const currentAnnotations = prev[imageIndex] || [];
      if (currentAnnotations.length === 0) return prev;
      return {
        ...prev,
        [imageIndex]: currentAnnotations.slice(0, -1),
      };
    });
  }, []);

  const clearAnnotations = useCallback((imageIndex: number) => {
    setAnnotations(prev => ({
      ...prev,
      [imageIndex]: [],
    }));
  }, []);

  return {
    annotations,
    addAnnotation,
    undoAnnotation,
    clearAnnotations,
    activeTool,
    setActiveTool,
  };
};
