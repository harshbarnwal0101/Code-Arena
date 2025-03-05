import { useState, useEffect } from 'react';

export function useContestValidation(formData) {
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    // Start time validation
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    } else {
      const startDate = new Date(formData.startTime);
      const now = new Date();
      if (startDate < now) {
        newErrors.startTime = 'Start time must be in the future';
      }
    }

    // Duration validation
    if (!formData.duration) {
      newErrors.duration = 'Duration is required';
    } else if (formData.duration < 30 || formData.duration > 300) {
      newErrors.duration = 'Duration must be between 30 and 300 minutes';
    }

    // Access code validation for private contests
    if (formData.isPrivate && !formData.accessCode) {
      newErrors.accessCode = 'Access code is required for private contests';
    }

    // Problems validation
    if (formData.problems.length === 0) {
      newErrors.problems = 'At least one problem is required';
    } else if (formData.problems.length > 10) {
      newErrors.problems = 'Maximum 10 problems allowed';
    }

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [formData]);

  return { errors, isValid };
} 