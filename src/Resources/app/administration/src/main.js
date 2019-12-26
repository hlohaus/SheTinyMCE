import { Component } from 'src/core/shopware';
import template from './extension/sw-tinymce.html.twig';
import './sw-tinymce.scss';

Component.override('sw-text-editor', {
    template,

    inject: ['systemConfigApiService'],

    data() {
        return {
            mediaModalIsOpen: false,
            domain: 'SheTinyMce'
        };
    },

    methods: {
        onCloseMediaModal() {
            this.mediaModalIsOpen = false;
        },

        onMediaSelectionChange(mediaItems) {
            mediaItems.forEach((item) => {
                if (this.filePickerMeta.filetype === 'file') {
                    const text = `${item.fileName}.${item.fileExtension}`;
                    this.filePickerCallback(item.url, {
                        title: item.translated.title,
                        text: text
                    });
                } else if (this.filePickerMeta.filetype === 'image') {
                    this.filePickerCallback(item.url, { alt: item.translated.alt });
                } else {
                    this.filePickerCallback(item.url);
                }
            });
        },

        onChange(e) {
            this.emitHtmlContent(e.target.getContent());
        },

        readAll() {
            return this.systemConfigApiService.getValues(this.domain, this.selectedSalesChannelId);
        },

        loadTiny() {
            const lang = Shopware.Application.getContainer('factory').locale.getLastKnownLocale();
            const contentCss = window.tinymceConfig.contentcss;
            window.tinymce.init(this.getTinyMceConfig(lang, contentCss));
        },

        getTinyMceConfig: function (lang, contentCss) {
            const me = this;
            const plugins = window.tinymceConfig.enablePro ?
                'print preview fullpage powerpaste casechange importcss' +
                ' searchreplace autolink autosave save directionality' +
                ' advcode visualblocks visualchars fullscreen image link media mediaembed' +
                ' template codesample table charmap hr pagebreak nonbreaking anchor' +
                ' toc insertdatetime advlist lists checklist wordcount tinymcespellchecker' +
                ' a11ychecker imagetools textpattern noneditable help formatpainter permanentpen' +
                ' pageembed charmap tinycomments mentions quickbars linkchecker emoticons advtable' :
                'iconfonts print preview paste importcss searchreplace autolink' +
                ' autosave save directionality code visualblocks visualchars' +
                ' fullscreen image link media template codesample table charmap' +
                ' hr pagebreak nonbreaking anchor toc insertdatetime advlist' +
                ' lists wordcount imagetools textpattern noneditable help charmap' +
                ' quickbars emoticons';
            return {
                target: this.$refs.textArea,
                language: lang.substring(0, 2),
                skin: window.tinymceConfig.skin || 'oxide',
                height: window.tinymceConfig.height || 300,
                plugins: plugins,
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
                content_css: contentCss ? contentCss.split(/\n/) : [],
                image_class_list: [{
                    title: 'None', value: ''
                }, {
                    title: 'Some class', value: 'class-name'
                }],
                browser_spellcheck: !!window.tinymceConfig.spellcheck,
                importcss_append: true,
                autosave_ask_before_unload: false,
                relative_urls: false,
                tinycomments_mode: 'embedded',
                file_picker_callback: function (callback, value, meta) {
                    /* Provide file and text for the link dialog */
                    me.mediaModalIsOpen = true;
                    me.filePickerCallback = callback;
                    me.filePickerMeta = meta;
                },
                templates: [
                    {
                        title: 'New Table', description: 'creates a new table', content: ''
                    }, {
                        title: 'Starting my story',
                        description: 'A cure for writers block',
                        content: 'Once upon a time...'
                    }
                ],
                template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
                template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
                image_caption: true,
                quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
                noneditable_noneditable_class: 'mceNonEditable',
                toolbar_drawer: 'sliding',
                contextmenu: window.tinymceConfig.spellcheck ? false : 'link image imagetools table',
                init_instance_callback: function (editor) {
                    editor.on('Change', me.onChange);
                },
                extended_valid_elements: 'script[src|async|defer|type|charset|crossorigin]'
            };
        },

        mapValues: function (values) {
            const config = {};
            Object.keys(values).forEach(key => {
                const newKey = key.replace('SheTinyMce.config.', '');
                config[newKey] = values[key];
            });
            return config;
        }
    },

    mounted() {
        if (this.isInlineEdit) {
            this.mountedComponent();
            return;
        }
        if (!window.tinymceConfig) {
            this.readAll().then((values) => {
                window.tinymceConfig = this.mapValues(values);
                this.loadTiny();
            });
        } else {
            this.loadTiny();
        }
    }
});

