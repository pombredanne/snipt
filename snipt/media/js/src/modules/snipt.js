
(function(Snipt) {

    SniptModel = Backbone.Model.extend({
    });
    SniptView = Backbone.View.extend({

        tagName: 'article',

        initialize: function() {
            this.model.view = this;
            this.model.bind('change', this.render, this);
            this.model.bind('destroy', this.remove, this);

            this.template     = _.template($('#snipt').html());
            this.editTemplate = _.template($('#edit').html());

            this.$el = $(this.el);
            this.$aside = $('aside', this.$el);
            this.$container = $('div.container', this.$el);
            this.$copyModal = $('div.copy-modal', this.$el);
            this.$copyModalBody = $('div.modal-body', this.$copyModal);
            this.$copyModalClose = $('a.close', this.$copyModal);
            this.$copyModalType = $('h4 span', this.$copyModal);
            this.$h1 = $('header h1 a', this.$el);
            this.$raw = $('div.raw', this.$el);
            this.$tags = $('section.tags ul', this.$aside);

            this.$copyModal.on('hidden', function(e) {
                $(this).parent().trigger('copyClose');
            });
        },
        events: {
            'click a.copy':     'copyFromClick',
            'click a.edit':     'edit',
            'click a.embed':    'embed',
            'click a.expand':   'expand',
            'click .container': 'selectFromClick',
            'copyRaw':          'copy',
            'copyClose':        'copyClose',
            'detail':           'detail',
            'deselect':         'deselect',
            'edit':             'edit',
            'embed':            'embed',
            'expand':           'expand',
            'next':             'next',
            'prev':             'prev',
            'selectSnipt':      'select',
            'test':             'test'
        },

        copy: function() {
            if (!this.$copyModal.is(':visible')) {
                var cmd;
                if (navigator.platform == 'MacPPC' ||
                    navigator.platform == 'MacIntel') {
                    cmd = 'Cmd';
                }
                else {
                    cmd = 'Ctrl';
                }

                this.$copyModalBody.append('<textarea class="raw"></textarea>');
                $textarea = $('textarea.raw', this.$copyModalBody).val(this.$raw.text());

                this.$copyModalType.text(cmd);
                this.$copyModal.modal('show');
                $textarea.select();
            }
        },
        copyClose: function() {
            $('textarea', this.$copyModal).remove();
        },
        copyFromClick: function() {
            this.copy();
            return false;
        },
        deselect: function() {
            if (!this.$copyModal.is(':visible')) {
                this.$el.removeClass('selected');
                window.$selected = false;
            }
        },
        detail: function() {
            window.location = this.model.get('url');
        },
        edit: function() {
            if (!$('section.main-edit:visible').length) {
                var editPane = this.editTemplate(this.model.toJSON());
                $main = $('section.main');
                $main.hide();
                $main.after(editPane);
            }
            return false;
        },
        embed: function() {
            alert('TODO');
        },
        expand: function() {
            this.$container.toggleClass('expanded', 100);
            this.$tags.toggleClass('expanded');
            this.select();
        },
        next: function() {
            window.site.$copyModals.modal('hide');
            nextSnipt = this.$el.next('article.snipt');
            if (nextSnipt.length) {
                return nextSnipt.trigger('selectSnipt');
            }
        },
        prev: function() {
            window.site.$copyModals.modal('hide');
            prevSnipt = this.$el.prev('article.snipt');
            if (prevSnipt.length) {
                return prevSnipt.trigger('selectSnipt');
            }
        },
        remove: function() {
            console.log('SniptView.remove() called');
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        select: function(fromClick) {

            $('article.selected', SniptList.$el).removeClass('selected');
            this.$el.addClass('selected');

            if (fromClick !== true) {
                if (SniptList.$snipts.index(this.$el) === 0) {
                    window.scrollTo(0, 0);
                } else {
                    $('html, body').animate({
                        scrollTop: this.$el.offset().top - 50
                    }, 0);
                }
            }

            window.$selected = this.$el;
        },
        selectFromClick: function(e) {
            this.select(true);
            e.stopPropagation();
        },
        test: function() {
            this.model.set({'title': 'Changed title!'});
        }
    });
    SniptListView = Backbone.View.extend({
        el: 'section#snipts',

        initialize: function(opts) {

            this.$snipts = opts.snipts;
            this.$snipts.each(this.addExistingSnipt);
            this.$el = $(this.el);

            this.keyboardShortcuts();
        },

        addExistingSnipt: function() {
            var $h1 = $('header h1 a', this);
            var data = {
                title: $h1.text(),
                url: $h1.attr('href')
            };
            var view = new SniptView({
                el: this,
                model: new SniptModel(data)
            });
        },
        keyboardShortcuts: function() {

            $selected = window.selected;
            $document = $(document);

            $document.bind('keydown', 'Shift+t', function() {
                if ($selected) {
                    $selected.trigger('test');
                }
            });
            $document.bind('keydown', 'j', function() {
                if (!$selected) {
                    SniptList.$snipts.eq(0).trigger('selectSnipt');
                } else {
                    $selected.trigger('next');
                }
            });
            $document.bind('keydown', 'k', function() {
                if (!$selected) {
                    SniptList.$snipts.eq(0).trigger('selectSnipt');
                } else {
                    $selected.trigger('prev');
                }
            });
            $document.bind('keydown', 'c', function(e) {
                if ($selected) {
                    e.preventDefault();
                    $selected.trigger('copyRaw');
                }
            });
            $document.bind('keydown', 'e', function() {
                if ($selected) {
                    if ($selected.hasClass('editable')) {
                        $selected.trigger('edit');
                    }
                }
            });
            $document.bind('keydown', 'esc', function() {
                if ($('section.main-edit:visible').length) {
                    $('section.main-edit').remove();
                    $('section.main').show();
                    $('html, body').animate({
                        scrollTop: $selected.offset().top - 50
                    }, 0);
                } else {
                    if ($selected) {
                        $selected.trigger('deselect');
                    }
                }
            });
            $document.bind('keydown', 'g', function() {
                if (window.$selected) {
                    window.$selected.trigger('deselect');
                }
                window.scrollTo(0, 0);
            });
            $document.bind('keydown', 'Shift+g', function() {
                if (window.$selected) {
                    window.$selected.trigger('deselect');
                }
                window.scrollTo(0, document.body.scrollHeight);
            });
            $document.bind('keydown', 'n', function() {
                var $anc = $('li.next a');
                if ($anc.length) {
                    if ($anc.attr('href') !== '#') {
                        window.location = $anc.attr('href');
                    }
                }
            });
            $document.bind('keydown', 'o', function() {
                if ($selected) {
                    if ($selected.hasClass('expandable')) {
                        $selected.trigger('expand');
                    }
                }
            });
            $document.bind('keydown', 'p', function() {
                var $anc = $('li.prev a');
                if ($anc.length) {
                    if ($anc.attr('href') !== '#') {
                        window.location = $anc.attr('href');
                    }
                }
            });
            $document.bind('keydown', 'v', function() {
                if ($selected) {
                    $selected.trigger('embed');
                }
            });
            $document.bind('keydown', 'return', function() {
                if ($selected) {
                    $selected.trigger('detail');
                }
            });
        }
    });
    Snipt.Views = {
        'SniptListView': SniptListView
    };

})(snipt.module('snipt'));
