/**
 * Form Detector - GPT-5 Style Modular Component
 * 
 * Detects and analyzes form elements for UX analysis.
 */
export class FormDetector {
  constructor(options = {}) {
    this.options = options;
  }

  detect(document) {
    const forms = [];
    const formElements = document.querySelectorAll('form');
    
    formElements.forEach((form, index) => {
      forms.push({
        id: `form_${index}`,
        method: form.method || 'get',
        action: form.action || '',
        inputs: form.querySelectorAll('input, textarea, select').length,
        required: form.querySelectorAll('[required]').length,
        validation: this._analyzeValidation(form)
      });
    });

    return {
      forms,
      totalForms: forms.length,
      metadata: { detectTime: Date.now() }
    };
  }

  _analyzeValidation(form) {
    return {
      hasValidation: form.querySelectorAll('[pattern], [required], [min], [max]').length > 0,
      validationTypes: []
    };
  }
}
