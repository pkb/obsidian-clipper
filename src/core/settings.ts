import { Template } from '../types/types';
import { 
	createDefaultTemplate, 
	deleteTemplate,
	duplicateTemplate,
	findTemplateById, 
	getEditingTemplateIndex,
	getTemplates, 
	loadTemplates, 
	saveTemplateSettings, 
	templates,
	cleanupTemplateStorage,
	rebuildTemplateList
} from '../managers/template-manager';
import { updateTemplateList, showTemplateEditor, resetUnsavedChanges, initializeAddPropertyButton } from '../managers/template-ui';
import { initializeGeneralSettings } from '../managers/general-settings';
import { showSettingsSection, initializeSidebar } from '../managers/settings-section-ui';
import { initializeInterpreterSettings } from '../managers/interpreter-settings';
import { initializeAutoSave } from '../utils/auto-save';
import { handleTemplateDrag, initializeDragAndDrop } from '../utils/drag-and-drop';
import { exportTemplate, showTemplateImportModal, copyTemplateToClipboard } from '../utils/import-export';
import { createIcons } from 'lucide';
import { icons } from '../icons/icons';
import { updateUrl, getUrlParameters } from '../utils/routing';
import { addBrowserClassToHtml } from '../utils/browser-detection';
import { initializeMenu } from '../managers/menu';
import { addMenuItemListener } from '../managers/menu';
import { getCurrentLanguage, setLanguage, getAvailableLanguages, getMessage } from '../utils/language-settings';
import { translatePage } from '../utils/i18n';

declare global {
	interface Window {
		cleanupTemplateStorage: () => Promise<void>;
		rebuildTemplateList: () => Promise<void>;
	}
}

window.cleanupTemplateStorage = cleanupTemplateStorage;
window.rebuildTemplateList = rebuildTemplateList;

document.addEventListener('DOMContentLoaded', async () => {
	const newTemplateBtn = document.getElementById('new-template-btn') as HTMLButtonElement;

	async function initializeSettings(): Promise<void> {
		// Initialize translations first
		await translatePage();
		
		await initializeGeneralSettings();
		await initializeInterpreterSettings();
		const loadedTemplates = await loadTemplates();
		updateTemplateList(loadedTemplates);
		initializeTemplateListeners();
		await handleUrlParameters();
		initializeSidebar();
		initializeAutoSave();
		initializeMenu('more-actions-btn', 'template-actions-menu');

		createIcons({ icons });

		// Initialize language selector
		const languageSelect = document.getElementById('language-select') as HTMLSelectElement;
		if (languageSelect) {
			await initializeLanguageSelector(languageSelect);
		}
	}

	async function initializeLanguageSelector(languageSelect: HTMLSelectElement): Promise<void> {
		try {
			// Initialize i18n first
			await translatePage();
			
			// Populate language options
			const languages = getAvailableLanguages();
			const currentLanguage = await getCurrentLanguage();
			
			languageSelect.innerHTML = languages.map(lang => {
				const displayName = lang.code === '' ? getMessage('systemDefault') : lang.name;
				return `<option value="${lang.code}" ${lang.code === currentLanguage ? 'selected' : ''}>${displayName}</option>`;
			}).join('');

			// Add change listener
			languageSelect.addEventListener('change', async () => {
				try {
					await setLanguage(languageSelect.value);
					window.location.reload(); // Force reload the current page
				} catch (error) {
					console.error('Failed to change language:', error);
				}
			});
		} catch (error) {
			console.error('Failed to initialize language selector:', error);
		}
	}

	function initializeTemplateListeners(): void {
		if (newTemplateBtn) {
			newTemplateBtn.addEventListener('click', () => {
				showTemplateEditor(null);
			});
		}

		addMenuItemListener('#duplicate-template-btn', 'template-actions-menu', duplicateCurrentTemplate);
		addMenuItemListener('#delete-template-btn', 'template-actions-menu', deleteCurrentTemplate);
		addMenuItemListener('.export-template-btn', 'template-actions-menu', exportTemplate);
		addMenuItemListener('.import-template-btn', 'template-actions-menu', showTemplateImportModal);
		addMenuItemListener('#copy-template-json-btn', 'template-actions-menu', copyCurrentTemplateToClipboard);
	}

	function duplicateCurrentTemplate(): void {
		const editingTemplateIndex = getEditingTemplateIndex();
		if (editingTemplateIndex !== -1) {
			const currentTemplate = templates[editingTemplateIndex];
			const newTemplate = duplicateTemplate(currentTemplate.id);
			saveTemplateSettings().then(() => {
				updateTemplateList();
				showTemplateEditor(newTemplate);
				updateUrl('templates', newTemplate.id);
			}).catch(error => {
				console.error('Failed to duplicate template:', error);
				alert('Failed to duplicate template. Please try again.');
			});
		}
	}

	async function deleteCurrentTemplate(): Promise<void> {
		const editingTemplateIndex = getEditingTemplateIndex();
		if (editingTemplateIndex !== -1) {
			const currentTemplate = templates[editingTemplateIndex];
			if (confirm(`Are you sure you want to delete the template "${currentTemplate.name}"?`)) {
				const success = await deleteTemplate(currentTemplate.id);
				if (success) {
					// Reload templates after deletion
					await loadTemplates();
					updateTemplateList();
					if (templates.length > 0) {
						showTemplateEditor(templates[0]);
					} else {
						showSettingsSection('general');
					}
				} else {
					alert('Failed to delete template. Please try again.');
				}
			}
		}
	}

	async function handleUrlParameters(): Promise<void> {
		const { section, templateId } = getUrlParameters();

		if (section === 'general' || section === 'interpreter' || section === 'properties' || section === 'highlighter') {
			showSettingsSection(section);
		} else if (templateId) {
			const template = findTemplateById(templateId);
			if (template) {
				showTemplateEditor(template);
			} else {
				console.error(`Template with id ${templateId} not found`);
				showSettingsSection('general');
			}
		} else {
			showSettingsSection('general');
		}
	}

	function copyCurrentTemplateToClipboard(): void {
		const editingTemplateIndex = getEditingTemplateIndex();
		if (editingTemplateIndex !== -1) {
			const currentTemplate = templates[editingTemplateIndex];
			copyTemplateToClipboard(currentTemplate);
		}
	}

	const templateForm = document.getElementById('template-settings-form');
	if (templateForm) {
		initializeAddPropertyButton();
		initializeDragAndDrop();
		handleTemplateDrag();
	}

	await addBrowserClassToHtml();
	await initializeSettings();
});
