import { Component } from 'src/core/shopware';
import template from './extension/sw-tinymce.html.twig';
import './sw-tinymce.scss';

Component.override('sw-text-editor', {
    template,

    data() {
        return {
            mediaModalIsOpen: false
        };
    },

    methods: {
        onCloseMediaModal() {
            this.mediaModalIsOpen = false;
        },

        onMediaSelectionChange(mediaItems) {
            mediaItems.forEach((item) => {
                this.filePickerCallback(item.url, { alt: item.translated.alt });
            });
        },

        onChange(e) {
            this.emitHtmlContent(e.target.getContent());
        }
    },

    mounted() {
        if (this.isInlineEdit) {
            this.mountedComponent();
            return;
        }
        const me = this;
        const lang = window.localStorage.getItem('sw-admin-locale') || 'en';
        window.tinymce.init({
            target: this.$refs.textArea,
            language: lang.substring(0, 2),
            height: 300,
            plugins: 'print preview paste importcss searchreplace autolink' +
            ' autosave save directionality code visualblocks visualchars' +
            ' fullscreen image link media template codesample table charmap' +
            ' hr pagebreak nonbreaking anchor toc insertdatetime advlist' +
            ' lists wordcount imagetools textpattern noneditable help charmap' +
            ' quickbars emoticons',
            menubar: 'file edit view insert format tools table help',
            toolbar: 'undo redo | bold italic underline strikethrough |' +
            ' fontselect fontsizeselect formatselect |' +
            ' alignleft aligncenter alignright alignjustify |' +
            ' outdent indent |  numlist bullist |' +
            ' forecolor backcolor removeformat | pagebreak |' +
            ' charmap emoticons | fullscreen  preview save print |' +
            ' insertfile image media template link anchor codesample |' +
            ' ltr rtl',
            toolbar_sticky: true,
            image_advtab: true,
            content_css: [],
            image_class_list: [
                { title: 'None', value: '' },
                { title: 'Some class', value: 'class-name' }
            ],
            browser_spellcheck: true,
            importcss_append: true,
            autosave_ask_before_unload: false,
            file_picker_callback: function (callback) {
                /* Provide file and text for the link dialog */
                me.mediaModalIsOpen = true;
                me.filePickerCallback = callback;
            },
            templates: [
                { title: 'New Table', description: 'creates a new table', content: '' },
                { title: 'Starting my story', description: 'A cure for writers block', content: 'Once upon a time...' }
            ],
            template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
            template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
            image_caption: true,
            quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
            noneditable_noneditable_class: 'mceNonEditable',
            toolbar_drawer: 'sliding',
            contextmenu: 'link image imagetools table',
            init_instance_callback: function (editor) {
                editor.on('Change', me.onChange);
            },
            extended_valid_elements: 'script[src|async|defer|type|charset]'
        });
    }
});

