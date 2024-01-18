import Util from '@services/util.js';
import Dictionary from '@services/dictionary.js';
import DropdownField from '@components/dropdown-field.js';
import QuestionTypeContract from '@mixins/question-type-contract.js';
import XAPI from '@mixins/xapi.js';
import '@styles/h5p-dropdown-field.scss';

export default class DropdownFieldApp extends H5P.EventDispatcher {
  /**
   * @class
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   * @param {object} [extras] Saved state, metadata, etc.
   */
  constructor(params, contentId, extras = {}) {
    super();

    Util.addMixins(
      DropdownFieldApp, [QuestionTypeContract, XAPI]
    );

    // Sanitize parameters
    this.params = Util.extend({
      dropdownLabels: [],
      l10n: {
        noDropdownsConfigured: 'No dropdown labels were configured!'
      },
      a11y: {
        selectARIALabel: 'Your options'
      },
      requiredField: false
    }, params);

    this.contentId = contentId;
    this.extras = extras;

    // Fill dictionary
    this.dictionary = new Dictionary();
    this.dictionary.fill({ l10n: this.params.l10n, a11y: this.params.a11y });

    const defaultLanguage = extras?.metadata?.defaultLanguage || 'en';
    this.languageTag = Util.formatLanguageCode(defaultLanguage);

    this.params.dropdownLabels = this.params.dropdownLabels
      .filter((label) => typeof label === 'string' && label)
      .map((label) =>  Util.decodeHTML(label));

    if (!this.params.dropdownLabels.length) {
      this.params.dropdownLabels.push(
        Util.decodeHTML(
          this.dictionary.get('l10n.noDropdownsConfigured')
        )
      );
    }

    this.params.dropdownLabels = ['---', ...this.params.dropdownLabels];

    this.previousState = extras?.previousState ?? {};

    this.dom = this.buildDOM();
  }

  /**
   * Attach library to wrapper.
   * @param {H5P.jQuery} $wrapper Content's container.
   */
  attach($wrapper) {
    $wrapper.get(0).classList.add('h5p-dropdown-field');
    $wrapper.get(0).appendChild(this.dom);
  }

  /**
   * Build main DOM.
   * @returns {HTMLElement} Main DOM.
   */
  buildDOM() {
    const dom = document.createElement('div');
    dom.classList.add('h5p-dropdown-field-main');

    if (this.params.taskDescription) {
      const descriptionDOM = document.createElement('div');
      descriptionDOM.classList.add('h5p-dropdown-field-description');
      descriptionDOM.innerHTML = this.params.taskDescription;
      dom.append(descriptionDOM);

      descriptionDOM.classList.toggle('required', this.params.requiredField);
    }

    this.dropdownField = new DropdownField({
      dropdownLabels: this.params.dropdownLabels,
      previousState: this.previousState.dropdown,
      selectARIALabel: this.dictionary.get('a11y.selectARIALabel'),
      required: this.params.requiredField
    });
    dom.append(this.dropdownField.getDOM());

    return dom;
  }

  /**
   * Retrieve textual representation as required by DocumentExportPage.
   * @returns {object} Textual representation as required by DocumentExportPage.
   */
  getInput() {
    return {
      description: Util.purifyHTML(this.params.taskDescription),
      value: this.dropdownField.getTextualRepresentation()
    };
  }

  /**
   * Determine whether input is filled, required by DocumentExportPage.
   * @returns {boolean} True if some checkbox is checked or not required.
   */
  isRequiredInputFilled() {
    if (!this.params.requiredField) {
      return true;
    }

    return this.dropdownField.isSomethingSelected();
  }

  /**
   * Mark field if empty until it's filled.
   */
  markEmptyField() {
    this.dropdownField.markAsEmpty();
  }
}
