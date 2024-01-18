import Util from '@services/util.js';
import './dropdown-field.scss';

export default class DropdownField {
  /**
   * @class
   * @param {object} params Parameters passed by the editor.
   */
  constructor(params = {}) {
    // Sanitize parameters
    this.params = Util.extend({
      dropdownLabels: [],
      previousState: { selectedIndex: 0 },
      checkboxGroupLabel: 'Your options',
      required: false
    }, params);

    this.dom = this.buildDOM();
  }

  /**
   * Get DOM.
   * @returns {HTMLElement} DOM.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Build dom.
   * Following https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox/
   * @returns {HTMLElement} DOM.
   */
  buildDOM() {
    const dropdownField = document.createElement('select');
    dropdownField.classList.add('h5p-dropdown-field-select');
    if (this.params.required) {
      dropdownField.setAttribute('required', '');
    }
    dropdownField.setAttribute('aria-label', this.params.selectARIALabel);
    dropdownField.setAttribute('aria-required', this.params.required);
    dropdownField.addEventListener('change', () => {
      this.wasAnswerGiven = true;
    });

    this.params.dropdownLabels.forEach((label, index) => {
      const option = document.createElement('option');
      option.value = index === 0 ? '' : label;
      option.innerText = Util.decodeHTML(label);

      if ((this.params.previousState?.selectedIndex ?? 0) === index) {
        option.setAttribute('selected', '');
      }
      dropdownField.appendChild(option);
    });

    return dropdownField;
  }

  /**
   * Get textual representation of checkbox.
   * @returns {string} Textual representation of dropdowns
   */
  getTextualRepresentation() {
    return this.params.dropdownLabels
      .filter((label, index) => index !== 0)
      .map((label, index) => {
        const selectedSuffix = this.dom.options.selectedIndex - 1 === index ?
          ' \u2713' :
          '';
        return `${label}${selectedSuffix}`;
      })
      .join('\n');
  }

  /**
   * Determine whether some option was selected.
   * @returns {boolean} True, if some option was selected.
   */
  isSomethingSelected() {
    return this.dom.options.selectedIndex > 0;
  }

  /**
   * Mark as empty depending on state.
   */
  markAsEmpty() {
    if (this.isSomethingSelected()) {
      this.dom.classList.remove('required-input');
      return;
    }

    this.dom.classList.add('required-input');
    this.dom.addEventListener('change', () => {
      this.dom.classList.remove('required-input');
    }, { once: true });
  }

  /**
   * Get xAPI response.
   * @returns {string} XAPI response.
   */
  getXAPIResponse() {
    return this.params.dropdownLabels[this.dom.options.selectedIndex];
  }

  /**
   * Get choices for xAPI.
   * @param {string} languageTag Language tag.
   * @returns {object} Choices for xAPI.
   */
  getXAPIChoices(languageTag) {
    return this.params.dropdownLabels
      .filter((label, index) => index !== 0)
      .map((label, index) => {
        const description = {};
        description[languageTag] = label;
        // Fallback for h5p-php-reporting, expects en-US
        description['en-US'] = description[languageTag];

        return {
          'id': `${index}`,
          'description': description
        };
      });
  }

  /**
   * Determine whether user has given an answer.
   * @returns {boolean} True, if user has given an answer.
   */
  getAnswerGiven() {
    return this.wasAnswerGiven;
  }

  /**
   * Reset.
   */
  reset() {
    this.wasAnswerGiven = false;
    this.dom.value = '';
  }

  /**
   * Get current state to answer H5P core call.
   * @returns {object} Current state.
   */
  getCurrentState() {
    return {
      selectedIndex: this.dom.options.selectedIndex
    };
  }
}
