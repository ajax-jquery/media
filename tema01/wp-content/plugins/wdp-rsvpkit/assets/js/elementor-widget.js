/**
 * RSVPKit Elementor Widget JavaScript
 */

(function ($) {
    'use strict';

    /**
     * Generate browser fingerprint for anti-spam protection
     * Creates a unique identifier based on browser/device characteristics
     * @returns {string} Base64-encoded fingerprint (max 32 chars)
     */
    function generateFingerprint() {
        try {
            var components = [
                navigator.userAgent || '',
                navigator.language || '',
                screen.width + 'x' + screen.height,
                screen.colorDepth || '',
                new Date().getTimezoneOffset(),
                navigator.hardwareConcurrency || 'unknown',
                navigator.platform || '',
                (navigator.plugins ? navigator.plugins.length : 0)
            ];

            // Simple hash function
            var str = components.join('|');
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
                var char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }

            // Convert to base36 for shorter string
            return Math.abs(hash).toString(36) + '_' + str.length.toString(36);
        } catch (e) {
            // Fallback if fingerprinting fails
            return 'fp_' + Math.random().toString(36).substring(2, 10);
        }
    }


    // Nama widget untuk hook element_ready
    var WIDGET_NAME = 'rsvpkit';

    // Initialize when document is ready
    $(document).ready(function () {
        initRSVPKit();

        // Global event delegation for Event Card Selection (fallback for dynamically shown elements)
        $(document).on('click', '.rsvpkit-event-card', function (e) {
            e.preventDefault();
            var $card = $(this);
            var $checkbox = $card.find('.rsvpkit-event-card-input');

            // Toggle selected state
            $card.toggleClass('selected');
            $checkbox.prop('checked', $card.hasClass('selected'));

            // Update aria-checked
            $card.attr('aria-checked', $card.hasClass('selected') ? 'true' : 'false');
        });

        // Keyboard support for event cards (Enter/Space)
        $(document).on('keydown', '.rsvpkit-event-card', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                $(this).trigger('click');
            }
        });
    });

    // Initialize on Elementor frontend
    $(window).on('elementor/frontend/init', function () {
        // Elementor frontend init
        var hookName = 'frontend/element_ready/' + WIDGET_NAME + '.default';
        elementorFrontend.hooks.addAction(hookName, function ($scope) {
            // Instantiate handler for this scope
            // Inisialisasi fitur form
            initRSVPKitWidget($scope);

            // Instansiasi handler reaktivitas berbasis Base dengan konteks $scope
            if (typeof elementorModules !== 'undefined' && elementorModules.frontend) {
                new WdpRsvpKitHandler({ $element: $scope });
            }
        });
    });

    // Catatan: Listener postMessage dihapus karena pendekatan baru
    // langsung memodifikasi DOM di iframe preview dari editor.js.

    /**
     * Handler reaktivitas Stats Grid berbasis Base handler
     * Terikat ke $scope via frontend/element_ready agar konteks widget tepat.
     */
    var WdpRsvpKitHandler = elementorModules.frontend.handlers.Base.extend({
        onInit: function () {
            elementorModules.frontend.handlers.Base.prototype.onInit.apply(this, arguments);
            // Inisialisasi dan mapping UI pertama kali
            this.refreshUi();
            // Debug: laporkan jumlah elemen yang ditemukan
            // Silent mode: no debug logs
            // Ikat listener perubahan kontrol
            this.bindEvents();
            // Terapkan state awal setelah satu frame untuk memberi waktu DOM settle
            var self = this;
            requestAnimationFrame(function () {
                self.refreshUi();
                self.applyAll();
            });
        },

        // Melakukan pemetaan ulang elemen UI yang relevan secara defensif
        refreshUi: function () {
            var $base = this.$element;
            // Cari kontainer widget spesifik sebagai basis pencarian
            var $widgetContainer = $base.find('.rsvpkit-widget');
            if (!$widgetContainer.length) {
                $widgetContainer = $base.closest('.elementor-element').find('.rsvpkit-widget');
            }
            var $scope = $widgetContainer.length ? $widgetContainer : $base;

            this.ui = {
                statsGrid: $scope.find('.rsvpkit-stats-grid'),
                cardTotal: $scope.find('.rsvpkit-stat-card.total'),
                cardGuests: $scope.find('.rsvpkit-stat-card.guests'),
                cardAttending: $scope.find('.rsvpkit-stat-card.attending'),
                cardNotAttending: $scope.find('.rsvpkit-stat-card.not-attending')
            };
        },

        bindEvents: function () {
            var isEdit = typeof elementorFrontend !== 'undefined' && elementorFrontend.isEditMode && elementorFrontend.isEditMode();
            var canBind = typeof this.onElementChange === 'function';
            var model = (typeof this.getModel === 'function') ? this.getModel() : null;

            var self = this;
            function bind(control, handler) {
                if (canBind) {
                    self.onElementChange(control, handler.bind(self));
                    return;
                }
                if (isEdit && model && typeof model.on === 'function') {
                    model.on('change:' + control, function () {
                        var v = self.getSetting(control);
                        handler.call(self, v);
                    });
                }
                // Silent if cannot bind; live toggle handled by editor observer
            }

            bind('show_stats_grid', this.onStatsGridToggle);
            bind('show_card_total', this.onCardTotalToggle);
            bind('show_card_guests', this.onCardGuestsToggle);
            bind('show_card_attending', this.onCardAttendingToggle);
            bind('show_card_not_attending', this.onCardNotAttendingToggle);
        },

        getSetting: function (key) {
            var settings = this.getElementSettings();
            return settings ? settings[key] : undefined;
        },

        isYes: function (v) {
            return v === 'yes' || v === true || v === 'on' || v === 1 || v === '1';
        },

        applyAll: function () {
            this.onStatsGridToggle(this.getSetting('show_stats_grid'));
            this.onCardTotalToggle(this.getSetting('show_card_total'));
            this.onCardGuestsToggle(this.getSetting('show_card_guests'));
            this.onCardAttendingToggle(this.getSetting('show_card_attending'));
            this.onCardNotAttendingToggle(this.getSetting('show_card_not_attending'));
        },

        onStatsGridToggle: function (newValue) {
            // Pastikan referensi UI terbaru
            this.refreshUi();
            var show = this.isYes(newValue);
            if (this.ui.statsGrid && this.ui.statsGrid.length) {
                // Hindari jQuery.toggle untuk elemen grid; gunakan kelas utilitas saja
                this.ui.statsGrid.toggleClass('rsvpkit-hidden', !show);
            }
        },

        onCardTotalToggle: function (newValue) {
            this.refreshUi();
            var show = this.isYes(newValue);
            if (this.ui.cardTotal && this.ui.cardTotal.length) {
                this.ui.cardTotal.toggleClass('rsvpkit-hidden', !show);
            }
        },

        onCardGuestsToggle: function (newValue) {
            this.refreshUi();
            var show = this.isYes(newValue);
            if (this.ui.cardGuests && this.ui.cardGuests.length) {
                this.ui.cardGuests.toggleClass('rsvpkit-hidden', !show);
            }
        },

        onCardAttendingToggle: function (newValue) {
            this.refreshUi();
            var show = this.isYes(newValue);
            if (this.ui.cardAttending && this.ui.cardAttending.length) {
                this.ui.cardAttending.toggleClass('rsvpkit-hidden', !show);
            }
        },

        onCardNotAttendingToggle: function (newValue) {
            this.refreshUi();
            var show = this.isYes(newValue);
            if (this.ui.cardNotAttending && this.ui.cardNotAttending.length) {
                this.ui.cardNotAttending.toggleClass('rsvpkit-hidden', !show);
            }
        }
    });

    /**
     * Initialize RSVPKit functionality
     */
    function initRSVPKit() {
        $('.rsvpkit-widget').each(function () {
            initRSVPKitWidget($(this));
        });
    }

    /**
     * Initialize individual RSVPKit widget
     */
    function initRSVPKitWidget($widget) {
        const $form = $widget.find('.rsvpkit-form-element');
        const $attendanceSelect = $form.find('select[name="attendance_status"]');
        const $guestCountField = $form.find('.rsvpkit-guest-count-field');
        const $eventSelectionField = $form.find('.rsvpkit-event-selection-field');
        const $submitBtn = $form.find('.rsvpkit-submit-btn');
        const $messages = $form.find('.rsvpkit-messages');
        const $messageTextarea = $form.find('textarea[name="message"]');
        const $charCount = $form.find('.rsvpkit-char-count');
        const $nameField = $form.find('input[name="guest_name"]');
        const $nameCount = $form.find('.rsvpkit-name-count');
        const $phoneField = $form.find('input[name="guest_phone"]');

        // Initialize character counter for message textarea
        if ($messageTextarea.length && $charCount.length) {
            $messageTextarea.on('input', function () {
                const currentLength = $(this).val().length;
                const maxLength = 500;
                $charCount.text(`(${currentLength}/${maxLength})`);

                // Change color when approaching limit
                if (currentLength > 450) {
                    $charCount.css('color', '#e74c3c');
                } else if (currentLength > 400) {
                    $charCount.css('color', '#f39c12');
                } else {
                    $charCount.css('color', '#666');
                }
            });
        }

        // Initialize character counter for guest_name
        if ($nameField.length && $nameCount.length) {
            $nameField.on('input', function () {
                const currentLength = $(this).val().length;
                const maxLength = 100;
                $nameCount.text(`(${currentLength}/${maxLength})`);
                if (currentLength > 90) {
                    $nameCount.css('color', '#e74c3c');
                } else if (currentLength > 80) {
                    $nameCount.css('color', '#f39c12');
                } else {
                    $nameCount.css('color', '#666');
                }
            });
        }

        // Enforce digits-only for phone input and validate on blur
        if ($phoneField.length) {
            $phoneField.on('input', function () {
                const v = $(this).val();
                const digitsOnly = v.replace(/\D/g, '');
                if (v !== digitsOnly) {
                    $(this).val(digitsOnly);
                }
            });
            $phoneField.on('blur', function () {
                validatePhone($(this));
            });
        }

        // Initial guest count visibility
        if ($guestCountField.length) {
            if ($attendanceSelect.length) {
                const initialStatus = $attendanceSelect.val();
                if (initialStatus === 'attending') {
                    $guestCountField.addClass('show').show();
                } else {
                    $guestCountField.removeClass('show').hide();
                }
            } else {
                // Attendance field hidden: default to attending
                $guestCountField.addClass('show').show();
            }
        }

        // Initialize Event Card Selection
        const $eventCards = $form.find('.rsvpkit-event-card');
        if ($eventCards.length) {
            // Click handler for event cards
            $eventCards.on('click', function (e) {
                e.preventDefault();
                const $card = $(this);
                const $checkbox = $card.find('.rsvpkit-event-card-input');

                // Toggle selected state
                $card.toggleClass('selected');
                $checkbox.prop('checked', $card.hasClass('selected'));

                // Update aria-checked
                $card.attr('aria-checked', $card.hasClass('selected') ? 'true' : 'false');
            });

            // Keyboard support (Enter/Space to toggle)
            $eventCards.on('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    $(this).trigger('click');
                }
            });

            // Sync visual state with checkbox on page load (for form repopulation)
            $eventCards.each(function () {
                const $card = $(this);
                const $checkbox = $card.find('.rsvpkit-event-card-input');
                if ($checkbox.is(':checked')) {
                    $card.addClass('selected');
                    $card.attr('aria-checked', 'true');
                }
            });
        }

        // Initial event selection visibility
        if ($eventSelectionField.length) {
            if ($attendanceSelect.length) {
                const initialStatus = $attendanceSelect.val();
                if (initialStatus === 'attending') {
                    $eventSelectionField.addClass('show').show();
                } else {
                    $eventSelectionField.removeClass('show').hide();
                }
            } else {
                // Attendance field hidden: default to attending
                $eventSelectionField.addClass('show').show();
            }
        }

        // Handle attendance status change
        $attendanceSelect.on('change', function () {
            const status = $(this).val();
            const isAttending = (status === 'attending');

            if ($guestCountField.length) {
                if (isAttending) {
                    $guestCountField.addClass('show').slideDown(300);
                } else {
                    $guestCountField.removeClass('show').slideUp(300);
                }
            }

            if ($eventSelectionField.length) {
                if (isAttending) {
                    $eventSelectionField.addClass('show').slideDown(300);
                } else {
                    $eventSelectionField.removeClass('show').slideUp(300);
                }
            }
        });

        // Handle form submission
        $form.on('submit', function (e) {
            e.preventDefault();

            if ($submitBtn.hasClass('loading')) {
                return false;
            }

            // Validate form
            if (!validateForm($form)) {
                return false;
            }

            // Show loading state
            setLoadingState($submitBtn, true);
            clearMessages($messages);

            // Prepare form data
            // Ensure phone field is '-' when empty
            var $phoneFieldSubmit = $form.find('input[name="guest_phone"]');
            if ($phoneFieldSubmit.length) {
                var phoneVal = $phoneFieldSubmit.val().trim();
                if (phoneVal === '') {
                    $phoneFieldSubmit.val('-');
                }
            }
            const formData = new FormData(this);
            formData.append('action', 'rsvpkit_submit');

            // Generate browser fingerprint for anti-spam
            formData.append('client_fingerprint', generateFingerprint());

            // Submit via AJAX
            $.ajax({
                url: rsvpkit_ajax.ajax_url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    handleSubmissionResponse(response, $form, $messages);
                },
                error: function (xhr, status, error) {
                    showMessage($messages, rsvpkit_ajax.messages.error, 'error');
                    if (window.RSVPKIT_DEBUG) console.error('RSVP submission error:', error);
                },
                complete: function () {
                    setLoadingState($submitBtn, false);
                }
            });
        });

        // Real-time validation
        $form.find('input[required], select[required]').on('blur', function () {
            validateField($(this));
        });

        $form.find('input[type="email"]').on('blur', function () {
            validateEmail($(this));
        });

        if ($nameField.length) {
            $nameField.on('blur', function () {
                validateName($(this));
            });
        }

        // Initialize Response Feed if enabled
        const $feed = $widget.find('.rsvpkit-response-feed[data-enabled="yes"]');
        if ($feed.length) {
            initResponseFeed($feed);
        }
    }

    /**
     * Validate entire form
     */
    function validateForm($form) {
        let isValid = true;
        const $messages = $form.find('.rsvpkit-messages');

        // Clear previous messages
        clearMessages($messages);

        // Validate required fields
        $form.find('input[required], select[required]').each(function () {
            if (!validateField($(this))) {
                isValid = false;
            }
        });

        // Validate email
        const $emailField = $form.find('input[type="email"]');
        if ($emailField.length && !validateEmail($emailField)) {
            isValid = false;
        }

        // Validate name length
        const $nameFieldValidate = $form.find('input[name="guest_name"]');
        if ($nameFieldValidate.length && !validateName($nameFieldValidate)) {
            isValid = false;
        }

        // Validate phone digits-only (optional)
        const $phoneFieldValidate = $form.find('input[name="guest_phone"]');
        if ($phoneFieldValidate.length && !validatePhone($phoneFieldValidate)) {
            isValid = false;
        }

        // Validate event selection (if required and attending)
        const $eventSelectionField = $form.find('.rsvpkit-event-selection-field');
        const $eventError = $form.find('.rsvpkit-event-error');
        if ($eventSelectionField.length && $eventSelectionField.data('require-event') === 'yes') {
            const $attendanceSelect = $form.find('select[name="attendance_status"]');
            const isAttending = !$attendanceSelect.length || $attendanceSelect.val() === 'attending';

            if (isAttending) {
                const $checkedEvents = $form.find('.rsvpkit-event-card-input:checked');
                if ($checkedEvents.length === 0) {
                    isValid = false;
                    // Show error message under event cards
                    if ($eventError.length) {
                        $eventError.show();
                    }
                    // Highlight event cards grid
                    $eventSelectionField.find('.rsvpkit-event-cards-grid').css({
                        'border': '2px solid #dc2626',
                        'border-radius': '8px',
                        'padding': '8px'
                    });
                } else {
                    // Clear error styling
                    if ($eventError.length) {
                        $eventError.hide();
                    }
                    $eventSelectionField.find('.rsvpkit-event-cards-grid').css({
                        'border': '',
                        'border-radius': '',
                        'padding': ''
                    });
                }
            }
        }

        // Show general error if validation failed
        if (!isValid) {
            showMessage($messages, rsvpkit_ajax.messages.required_fields, 'error');
        }

        return isValid;
    }

    /**
     * Validate individual field
     */
    function validateField($field) {
        const value = $field.val().trim();
        const isRequired = $field.prop('required');

        if (isRequired && !value) {
            addFieldError($field);
            return false;
        }

        removeFieldError($field);
        return true;
    }

    /**
     * Validate email field
     */
    function validateEmail($field) {
        const email = $field.val().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email && !emailRegex.test(email)) {
            addFieldError($field);
            return false;
        }

        removeFieldError($field);
        return true;
    }

    /**
     * Validate name field (required, max 100 chars)
     */
    function validateName($field) {
        const value = $field.val().trim();
        if (!value) {
            addFieldError($field);
            return false;
        }
        if (value.length > 100) {
            addFieldError($field);
            return false;
        }
        removeFieldError($field);
        return true;
    }

    /**
     * Validate phone field: optional, digits-only; empty will be set to '-'
     */
    function validatePhone($field) {
        const value = $field.val().trim();
        if (!value) {
            // Empty is allowed; handled before submit by setting '-'
            removeFieldError($field);
            return true;
        }
        const digitsOnlyRegex = /^\d+$/;
        if (!digitsOnlyRegex.test(value)) {
            addFieldError($field);
            return false;
        }
        removeFieldError($field);
        return true;
    }

    /**
     * Add error styling to field
     */
    function addFieldError($field) {
        $field.addClass('error').css({
            'border-color': '#e74c3c',
            'box-shadow': '0 0 0 3px rgba(231, 76, 60, 0.1)'
        });
    }

    /**
     * Remove error styling from field
     */
    function removeFieldError($field) {
        $field.removeClass('error').css({
            'border-color': '',
            'box-shadow': ''
        });
    }

    /**
     * Handle form submission response
     */
    function handleSubmissionResponse(response, $form, $messages) {
        try {
            const data = typeof response === 'string' ? JSON.parse(response) : response;

            if (data.success) {
                showMessage($messages, data.message, 'success');
                resetForm($form);

                // Update submission token and nonce for next submission (prevents "session expired" on re-submit)
                if (data.new_token) {
                    $form.find('input[name="submission_token"]').val(data.new_token);
                }
                if (data.new_nonce) {
                    $form.find('input[name="rsvpkit_nonce"]').val(data.new_nonce);
                }

                // Scroll to success message
                $('html, body').animate({
                    scrollTop: $messages.offset().top - 100
                }, 500);

                // Refresh stats grid numbers if present
                try {
                    const $widget = $form.closest('.rsvpkit-widget');
                    const $statsGrid = $widget.find('.rsvpkit-stats-grid');
                    const postId = parseInt($statsGrid.data('post-id'), 10);
                    if ($statsGrid.length && postId) {
                        refreshRSVPStats($statsGrid, postId);
                    }
                } catch (err) {
                    if (window.RSVPKIT_DEBUG) console.warn('RSVPKit: failed to refresh stats grid', err);
                }

                // === Immediate Feed Refresh ===
                // Trigger immediate refresh for the built-in response feed in the same widget
                try {
                    const $widget = $form.closest('.rsvpkit-widget');
                    const $feed = $widget.find('.rsvpkit-response-feed[data-enabled="yes"]');
                    if ($feed.length) {
                        $feed.trigger('rsvpkit:refresh_feed');
                    }
                } catch (err) {
                    if (window.RSVPKIT_DEBUG) console.warn('RSVPKit: failed to trigger feed refresh', err);
                }

                // Broadcast custom event so FeedKit widgets on the same page also refresh immediately
                try {
                    const postId = parseInt($form.find('input[name="post_id"]').val(), 10) || 0;
                    $(document).trigger('rsvpkit:response_submitted', { post_id: postId });
                } catch (err) {
                    if (window.RSVPKIT_DEBUG) console.warn('RSVPKit: failed to broadcast submission event', err);
                }

            } else {
                showMessage($messages, data.message || rsvpkit_ajax.messages.error, 'error');
            }
        } catch (e) {
            showMessage($messages, rsvpkit_ajax.messages.error, 'error');
            if (window.RSVPKIT_DEBUG) console.error('Error parsing response:', e);
        }
    }

    /**
     * Show message
     */
    function showMessage($container, message, type) {
        const $message = $('<div class="rsvpkit-message ' + type + '">' + message + '</div>');
        $container.append($message);

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(function () {
                $message.fadeOut(300, function () {
                    $(this).remove();
                });
            }, 5000);
        }
    }

    /**
     * Clear all messages
     */
    function clearMessages($container) {
        $container.empty();
    }

    /**
     * Set loading state for submit button
     */
    function setLoadingState($button, loading) {
        if (loading) {
            $button.addClass('loading').prop('disabled', true);
        } else {
            $button.removeClass('loading').prop('disabled', false);
        }
    }

    /**
     * Reset form to initial state
     */
    function resetForm($form) {
        $form[0].reset();
        $form.find('.rsvpkit-guest-count-field').removeClass('show').hide();
        $form.find('input, select, textarea').removeClass('error').css({
            'border-color': '',
            'box-shadow': ''
        });

        // Reset Event Selection State
        $form.find('.rsvpkit-event-card').removeClass('selected');
        $form.find('.rsvpkit-event-error').hide();
        $form.find('.rsvpkit-event-cards-grid').css({
            'border': '',
            'border-radius': '',
            'padding': ''
        });

        // Sync UI with reset state
        $form.find('select[name="attendance_status"]').trigger('change');
    }

    /**
     * Response Feed: initialization
     */
    function initResponseFeed($feed) {
        // Cleanup: clear any previous polling interval and event handlers for re-initialization
        var prevPollId = $feed.data('rsvpkit-poll-id');
        if (prevPollId) {
            clearInterval(prevPollId);
            $feed.removeData('rsvpkit-poll-id');
        }
        $feed.off('rsvpkit:refresh_feed');

        // Post ID resolution: prefer explicit data-post-id, else decide using flags
        let postId = parseInt($feed.data('post-id'), 10);
        if (!postId || isNaN(postId)) {
            const useCurrent = String($feed.data('use-current') || '').toLowerCase();
            const targetPostId = parseInt($feed.data('target-post-id'), 10);
            const defaultPostId = parseInt($feed.data('post-id-default'), 10);
            if (useCurrent === 'yes') {
                postId = defaultPostId || targetPostId || 0;
            } else {
                postId = targetPostId || defaultPostId || 0;
            }
        }
        const perPage = parseInt($feed.data('per-page'), 10) || 10;
        const mode = ($feed.data('mode') || 'load_more');
        const showBadge = ($feed.data('show-badge') === 'yes');
        const badgeType = String($feed.data('badge-type') || 'text');
        const badgeIconView = String($feed.data('badge-icon-view') || 'default');
        const badgeIconAttending = String($feed.data('badge-icon-attending') || 'fas fa-check');
        const badgeIconNotAttending = String($feed.data('badge-icon-not-attending') || 'fas fa-times');
        const showDateTime = ($feed.data('show-datetime') === 'yes');
        const avatarType = String($feed.data('avatar-type') || 'initials').toLowerCase();
        const avatarUrl = String($feed.data('avatar-url') || '');

        const $list = $feed.find('.rsvpkit-feed-list');
        const $loadMore = $feed.find('.rsvpkit-feed-load-more');
        const $pagination = $feed.find('.rsvpkit-feed-pagination');
        const $prev = $feed.find('.rsvpkit-feed-prev');
        const $next = $feed.find('.rsvpkit-feed-next');
        const $pageInfo = $feed.find('.rsvpkit-feed-page-info');

        // i18n labels (with data-* overrides)
        const labelAttending = String($feed.data('label-attending') || (rsvpkit_ajax && rsvpkit_ajax.strings && rsvpkit_ajax.strings.status_attending) || 'Attendance');
        const labelNotAttendance = String($feed.data('label-not-attendance') || (rsvpkit_ajax && rsvpkit_ajax.strings && rsvpkit_ajax.strings.status_not_attending) || 'Not Attendance');
        const labelPrev = String($feed.data('label-prev') || 'Prev');
        const labelNext = String($feed.data('label-next') || 'Next');
        const labelLoadMore = String($feed.data('label-load-more') || 'Load More');

        const state = {
            page: 1,
            perPage: perPage,
            total: 0,
            loading: false
        };

        function apiFetch(page) {
            const params = {
                action: rsvpkit_ajax.responses.action,
                nonce: rsvpkit_ajax.responses.nonce,
                post_id: postId,
                page: page,
                per_page: state.perPage
            };
            return $.get(rsvpkit_ajax.ajax_url, params)
                .then(function (resp) {
                    const data = (typeof resp === 'string') ? JSON.parse(resp) : resp;
                    if (!data.success) throw new Error('Failed to load responses');
                    return data;
                });
        }

        function renderItem(item) {
            function isValidImageUrl(url) {
                if (!url) return false;
                const s = String(url).trim();
                if (!/^https?:\/\//i.test(s) && !s.startsWith('/') && !s.startsWith('./') && !s.startsWith('../')) {
                    return false;
                }
                return /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(s);
            }
            function computeInitials(name) {
                const safe = (name || '').trim();
                if (!safe) return 'NA';
                const words = safe.split(/\s+/).filter(Boolean);
                if (words.length <= 1) {
                    return words[0].slice(0, 2).toUpperCase();
                }
                // Multi-kata (>1): ambil 1 huruf pertama dari 2 kata awal saja
                const first = (words[0] || '').slice(0, 1);
                const second = (words[1] || '').slice(0, 1);
                return (first + second).toUpperCase();
            }
            const initials = computeInitials(item.guest_name);
            const initialsClass = initials.length > 4 ? 'extra-long-initials' : (initials.length > 2 ? 'long-initials' : '');
            const statusText = (item.attendance_status === 'attending' ? labelAttending : labelNotAttendance);
            let badgeHtml = '';
            if (showBadge) {
                if (badgeType === 'icon') {
                    const iconClass = (item.attendance_status === 'attending') ? badgeIconAttending : badgeIconNotAttending;
                    const statusClass = (item.attendance_status === 'attending') ? 'attending' : 'not-attending';
                    const viewClass = (badgeIconView !== 'default') ? ' rsvpkit-view-' + badgeIconView : '';
                    badgeHtml = '<span class="rsvpkit-badge-icon ' + statusClass + viewClass + '"><i class="' + escapeHtml(iconClass) + '"></i></span>';
                } else {
                    badgeHtml = '<span class="rsvpkit-badge ' + (item.attendance_status === 'attending' ? 'attending' : 'not-attending') + '">' + escapeHtml(statusText) + '</span>';
                }
            }
            const dateObj = new Date(item.created_at_iso || item.created_at);
            const locale = (window.rsvpkit_ajax && rsvpkit_ajax.locale) ? String(rsvpkit_ajax.locale).toLowerCase() : 'en';
            let dateText = '';
            if (showDateTime) {
                try {
                    if (locale === 'id') {
                        // "17 Februari pukul 17.00"
                        const datePart = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long' }).format(dateObj);
                        const timePart = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).format(dateObj);
                        dateText = datePart + ' pukul ' + timePart.replace(':', '.');
                    } else {
                        // "February 17 at 5:00 PM"
                        const datePart = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(dateObj);
                        const timePart = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(dateObj);
                        dateText = datePart + ' at ' + timePart;
                    }
                } catch (e) {
                    // Fallback if Intl fails or date is invalid
                    dateText = item.created_at;
                }
            }
            const avatarHtml = (avatarType === 'image' && isValidImageUrl(avatarUrl))
                ? ('<div class="rsvpkit-avatar">'
                    + '<img class="rsvpkit-avatar-img" src="' + escapeHtml(avatarUrl) + '" alt="Avatar" loading="lazy"'
                    + ' data-initials="' + escapeHtml(initials) + '" data-initials-class="' + escapeHtml(initialsClass) + '" />'
                    + '</div>')
                : ('<div class="rsvpkit-avatar ' + initialsClass + '">' + escapeHtml(initials) + '</div>');
            return (
                '<div class="rsvpkit-feed-item">'
                + '<div class="rsvpkit-feed-col-left">'
                + avatarHtml
                + '</div>'
                + '<div class="rsvpkit-feed-col-right">'
                + '<div class="rsvpkit-feed-header">'
                + '<strong class="rsvpkit-feed-name">' + escapeHtml(item.guest_name) + '</strong>'
                + (badgeHtml ? ' ' + badgeHtml : '')
                + '</div>'
                + (showDateTime && dateText ? '<div class="rsvpkit-feed-time">' + escapeHtml(dateText) + '</div>' : '')
                + '<div class="rsvpkit-feed-message">' + safeMessageHTML(item.message || '') + '</div>'
                + '</div>'
                + '</div>'
            );
        }

        function renderList(items, replace) {
            const html = items.map(renderItem).join('');
            if (replace) {
                $list.html(html);
            } else {
                $list.append(html);
            }
            // Attach error fallback for avatar images: replace with initials on failure
            $list.find('.rsvpkit-avatar-img').off('error.rsvpkit').on('error.rsvpkit', function () {
                const $img = $(this);
                const initials = String($img.data('initials') || 'NA');
                const cls = String($img.data('initials-class') || '');
                const $wrap = $img.closest('.rsvpkit-avatar');
                $wrap.empty().text(initials).addClass(cls);
            });
        }

        function updateControls() {
            if (mode === 'load_more') {
                $pagination.hide();
                $loadMore.show();
                const totalPages = Math.ceil(state.total / state.perPage);
                if (state.page >= totalPages) {
                    $loadMore.hide();
                } else {
                    $loadMore.show();
                }
            } else {
                $loadMore.hide();
                $pagination.show();
                const totalPages = Math.max(1, Math.ceil(state.total / state.perPage));
                $prev.prop('disabled', state.page <= 1);
                $next.prop('disabled', state.page >= totalPages);
                // Hide edge buttons when not applicable for cleaner UI
                $prev.toggle(state.page > 1);
                $next.toggle(state.page < totalPages);
                $pageInfo.text('');
                $pageInfo.hide();

                // Build/refresh page numbers
                let $numbers = $pagination.find('.rsvpkit-feed-page-numbers');
                if (!$numbers.length) {
                    $numbers = $('<span class="rsvpkit-feed-page-numbers"></span>');
                    // Place before pageInfo for better UX
                    $numbers.insertBefore($pageInfo);
                }
                $numbers.empty();
                // Compute 3-number window
                const range = (function computeWindow(page, total) {
                    const t = Math.max(1, total);
                    if (t <= 3) return { start: 1, end: t };
                    if (page <= 2) return { start: 1, end: 3 };
                    if (page >= t - 1) return { start: t - 2, end: t };
                    return { start: page - 1, end: page + 1 };
                })(state.page, totalPages);
                for (let p = range.start; p <= range.end; p++) {
                    const $btn = $('<button type="button" class="rsvpkit-page-number" aria-label="Page ' + p + '"></button>').text(p).attr('data-page', p);
                    if (p === state.page) { $btn.addClass('active').attr('aria-current', 'page'); }
                    $numbers.append($btn);
                }
            }
        }

        function initialLoad() {
            state.loading = true;
            apiFetch(1).then(function (data) {
                state.page = data.pagination.current_page;
                state.perPage = data.pagination.per_page;
                state.total = data.pagination.total_responses;
                renderList(data.responses, true);
                // Apply statistics to the grid in the same widget
                try {
                    const $widget = $feed.closest('.rsvpkit-widget');
                    const $statsGrid = $widget.find('.rsvpkit-stats-grid');
                    if ($statsGrid.length && data.statistics) {
                        applyStatisticsToGrid($statsGrid, data.statistics);
                    }
                } catch (err) { if (window.RSVPKIT_DEBUG) console.warn('RSVPKit: apply stats (initial) failed', err); }
                updateControls();
            }).catch(function (err) {
                if (window.RSVPKIT_DEBUG) console.error('RSVPKit feed error:', err);
            }).always(function () {
                state.loading = false;
            });
        }

        // Initialize navigation labels on UI
        $loadMore.text(labelLoadMore);
        $prev.html('&laquo; ' + escapeHtml(labelPrev));
        $next.html(escapeHtml(labelNext) + ' &raquo;');

        // Events
        $loadMore.on('click', function () {
            if (state.loading) return;
            const totalPages = Math.ceil(state.total / state.perPage);
            if (state.page >= totalPages) return;
            state.loading = true;
            apiFetch(state.page + 1).then(function (data) {
                state.page = data.pagination.current_page;
                state.total = data.pagination.total_responses;
                renderList(data.responses, false);
                // Apply stats alongside load-more
                try {
                    const $widget = $feed.closest('.rsvpkit-widget');
                    const $statsGrid = $widget.find('.rsvpkit-stats-grid');
                    if ($statsGrid.length && data.statistics) {
                        applyStatisticsToGrid($statsGrid, data.statistics);
                    }
                } catch (err) { if (window.RSVPKIT_DEBUG) console.warn('RSVPKit: apply stats (load more) failed', err); }
                updateControls();
            }).catch(function (err) {
                if (window.RSVPKIT_DEBUG) console.error('RSVPKit feed load more error:', err);
            }).always(function () { state.loading = false; });
        });

        $prev.on('click', function () {
            if (state.loading) return;
            if (state.page <= 1) return;
            state.loading = true;
            apiFetch(state.page - 1).then(function (data) {
                state.page = data.pagination.current_page;
                state.total = data.pagination.total_responses;
                renderList(data.responses, true);
                // Apply stats on prev navigation
                try {
                    const $widget = $feed.closest('.rsvpkit-widget');
                    const $statsGrid = $widget.find('.rsvpkit-stats-grid');
                    if ($statsGrid.length && data.statistics) {
                        applyStatisticsToGrid($statsGrid, data.statistics);
                    }
                } catch (err) { if (window.RSVPKIT_DEBUG) console.warn('RSVPKit: apply stats (prev) failed', err); }
                updateControls();
            }).always(function () { state.loading = false; });
        });
        $next.on('click', function () {
            if (state.loading) return;
            const totalPages = Math.ceil(state.total / state.perPage);
            if (state.page >= totalPages) return;
            state.loading = true;
            apiFetch(state.page + 1).then(function (data) {
                state.page = data.pagination.current_page;
                state.total = data.pagination.total_responses;
                renderList(data.responses, true);
                // Apply stats on next navigation
                try {
                    const $widget = $feed.closest('.rsvpkit-widget');
                    const $statsGrid = $widget.find('.rsvpkit-stats-grid');
                    if ($statsGrid.length && data.statistics) {
                        applyStatisticsToGrid($statsGrid, data.statistics);
                    }
                } catch (err) { if (window.RSVPKIT_DEBUG) console.warn('RSVPKit: apply stats (next) failed', err); }
                updateControls();
            }).always(function () { state.loading = false; });
        });

        // Click on page number buttons
        $pagination.on('click', '.rsvpkit-page-number', function () {
            if (state.loading) return;
            const targetPage = parseInt($(this).data('page'), 10);
            if (!targetPage || targetPage === state.page) return;
            const totalPages = Math.ceil(state.total / state.perPage);
            if (targetPage < 1 || targetPage > totalPages) return;
            state.loading = true;
            apiFetch(targetPage).then(function (data) {
                state.page = data.pagination.current_page;
                state.total = data.pagination.total_responses;
                renderList(data.responses, true);
                // Apply stats on direct page jump
                try {
                    const $widget = $feed.closest('.rsvpkit-widget');
                    const $statsGrid = $widget.find('.rsvpkit-stats-grid');
                    if ($statsGrid.length && data.statistics) {
                        applyStatisticsToGrid($statsGrid, data.statistics);
                    }
                } catch (err) { if (window.RSVPKIT_DEBUG) console.warn('RSVPKit: apply stats (page jump) failed', err); }
                updateControls();
            }).always(function () { state.loading = false; });
        });

        // Polling for new responses (refresh first page)
        if (rsvpkit_ajax.responses && rsvpkit_ajax.responses.poll_interval_ms) {
            var pollId = setInterval(function () {
                apiFetch(1).then(function (data) {
                    // If we are on page 1, replace list; else do nothing
                    if (state.page === 1) {
                        state.total = data.pagination.total_responses;
                        renderList(data.responses, true);
                        // Apply stats on polling refresh
                        try {
                            const $widget = $feed.closest('.rsvpkit-widget');
                            const $statsGrid = $widget.find('.rsvpkit-stats-grid');
                            if ($statsGrid.length && data.statistics) {
                                applyStatisticsToGrid($statsGrid, data.statistics);
                            }
                        } catch (err) { if (window.RSVPKIT_DEBUG) console.warn('RSVPKit: apply stats (polling) failed', err); }
                        updateControls();
                    }
                });
            }, parseInt(rsvpkit_ajax.responses.poll_interval_ms, 10));
            $feed.data('rsvpkit-poll-id', pollId);
        }

        // Listen for immediate refresh trigger (from form submit in same widget)
        $feed.on('rsvpkit:refresh_feed', function () {
            if (state.loading) return;
            state.loading = true;
            apiFetch(1).then(function (data) {
                state.page = 1;
                state.total = data.pagination.total_responses;
                renderList(data.responses, true);
                try {
                    const $widget = $feed.closest('.rsvpkit-widget');
                    const $statsGrid = $widget.find('.rsvpkit-stats-grid');
                    if ($statsGrid.length && data.statistics) {
                        applyStatisticsToGrid($statsGrid, data.statistics);
                    }
                } catch (err) { if (window.RSVPKIT_DEBUG) console.warn('RSVPKit: apply stats (immediate refresh) failed', err); }
                updateControls();
            }).always(function () { state.loading = false; });
        });

        // Listen for global submission event (to also refresh this feed)
        $(document).on('rsvpkit:response_submitted', function (e, detail) {
            // Only refresh if the submission is for the same post or if post ID is 0 (unknown)
            if (detail && detail.post_id && postId && detail.post_id !== postId) return;
            $feed.trigger('rsvpkit:refresh_feed');
        });

        // Kick off initial load
        // If mode is pagination, ensure controls show immediately
        if (mode === 'pagination') {
            $pagination.show();
            $loadMore.hide();
        }
        initialLoad();
    }

    // Helper: basic HTML escape
    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    // Helper: render safe message with emoji entities
    function safeMessageHTML(str) {
        if (str == null) return '';
        let s = String(str);
        // Normalize broken entities: &xNNNN; -> &#xNNNN;
        s = s.replace(/&x([0-9A-Fa-f]+);/g, '&#x$1;');
        // Escape angle brackets to prevent HTML injection; keep & so emoji entities stay intact
        s = s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        // Convert newlines to <br>
        s = s.replace(/\r?\n/g, '<br>');
        return s;
    }

    // Helper: apply statistics numbers to the grid within a widget
    function applyStatisticsToGrid($statsGrid, stats) {
        if (!$statsGrid || !$statsGrid.length || !stats) return;
        const map = {
            total_responses: stats.total_responses || 0,
            attending_count: stats.attending_count || 0,
            not_attending_count: stats.not_attending_count || 0,
            total_guests: stats.total_guests || 0
        };
        try {
            Object.keys(map).forEach(function (key) {
                $statsGrid.find('.rsvpkit-stat-number[data-stat-key="' + key + '"]').text(map[key]);
            });
        } catch (err) { if (window.RSVPKIT_DEBUG) console.warn('RSVPKit: apply statistics failed', err); }
    }

    /**
     * RSVPKit Dashboard functionality
     */
    window.RSVPKitDashboard = {

        /**
         * Load responses for dashboard
         */
        loadResponses: function (postId, page, filters) {
            page = page || 1;
            filters = filters || {};

            const data = {
                action: 'rsvpkit_get_responses',
                nonce: rsvpkit_ajax.nonce,
                post_id: postId,
                page: page,
                per_page: 20,
                ...filters
            };

            return $.get(rsvpkit_ajax.ajax_url, data);
        },

        /**
         * Delete response by token
         */
        deleteResponse: function (token) {
            if (!confirm('Apakah Anda yakin ingin menghapus ucapan ini?')) {
                return Promise.reject('Cancelled');
            }

            const data = {
                action: 'rsvpkit_delete_response',
                nonce: wp.ajax.settings.nonce,
                token: token
            };

            return $.post(rsvpkit_ajax.ajax_url, data);
        },

        /**
         * Format date for display
         */
        formatDate: function (dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        /**
         * Get attendance status text
         */
        getAttendanceText: function (status) {
            if (typeof rsvpkit_ajax !== 'undefined' && rsvpkit_ajax.strings) {
                return status === 'attending' ? rsvpkit_ajax.strings.status_attending : rsvpkit_ajax.strings.status_not_attending;
            }
            return status === 'attending' ? 'Hadir' : 'Tidak Hadir';
        },

        /**
         * Get attendance status class
         */
        getAttendanceClass: function (status) {
            return status === 'attending' ? 'attending' : 'not-attending';
        }
    };

    /**
     * Refresh stats grid numbers using the existing get_responses endpoint
     */
    function refreshRSVPStats($statsGrid, postId) {
        if (!$statsGrid || !$statsGrid.length || !postId) return;
        const data = {
            action: (rsvpkit_ajax && rsvpkit_ajax.responses && rsvpkit_ajax.responses.action) ? rsvpkit_ajax.responses.action : 'rsvpkit_get_responses',
            // Use the correct nonce for get_responses to pass server verification
            nonce: (rsvpkit_ajax && rsvpkit_ajax.responses && rsvpkit_ajax.responses.nonce) ? rsvpkit_ajax.responses.nonce : rsvpkit_ajax.nonce,
            post_id: postId,
            page: 1,
            per_page: 1
        };
        $.get(rsvpkit_ajax.ajax_url, data).done(function (resp) {
            try {
                const payload = typeof resp === 'string' ? JSON.parse(resp) : resp;
                if (!payload || !payload.success || !payload.statistics) return;
                const stats = payload.statistics;
                const map = {
                    total_responses: stats.total_responses || 0,
                    attending_count: stats.attending_count || 0,
                    not_attending_count: stats.not_attending_count || 0,
                    total_guests: stats.total_guests || 0
                };
                // Update DOM numbers by data-stat-key
                Object.keys(map).forEach(function (key) {
                    $statsGrid.find('.rsvpkit-stat-number[data-stat-key="' + key + '"]').text(map[key]);
                });
            } catch (e) {
                if (window.RSVPKIT_DEBUG) console.warn('RSVPKit: invalid stats refresh payload', e);
            }
        });
    }

    // Bridge lama berbasis postMessage dihapus. Reaktivitas kini ditangani oleh
    // WdpRsvpKitStatsHandler melalui hook 'frontend/element_ready'.

})(jQuery);