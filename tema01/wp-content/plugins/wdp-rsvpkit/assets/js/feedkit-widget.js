/**
 * RSVPKit Feed Kit Widget JavaScript
 * Handles horizontal slider functionality and real-time updates
 */
(function ($) {
    'use strict';

    /**
     * FeedKit Slider Class
     */
    /**
     * Format date client-side to match user's local timezone
     * Shared function for both initial render and real-time updates
     */
    function formatClientDate(isoDate) {
        if (!isoDate) return '';

        try {
            const date = new Date(isoDate);
            // Format: "17 Februari 2024 pukul 18.00"
            const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
            const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

            // Use 'id-ID' for consistency with "Februari", or browser default if preferred
            const userLang = 'id-ID';

            const datePart = date.toLocaleDateString(userLang, dateOptions);
            const timePart = date.toLocaleTimeString(userLang, timeOptions).replace(':', '.'); // Force dot separator

            return `${datePart} pukul ${timePart}`;
        } catch (e) {
            console.error('FeedKit: Date parsing error', e);
            return new Date(isoDate).toLocaleString();
        }
    }

    /**
     * Initialize client-side time formatting for existing items
     */
    function initClientTimeFormatting($scope) {
        const $container = $scope ? $scope : $(document);

        $container.find('.rsvpkit-client-time').each(function () {
            const $el = $(this);
            const isoDate = $el.data('iso');

            if (isoDate && !$el.data('formatted')) {
                const formattedDate = formatClientDate(isoDate);
                if (formattedDate) {
                    $el.text(formattedDate);
                    $el.data('formatted', true);
                    $el.css('opacity', 1); // Ensure it's visible if we hid it to prevent flash
                }
            }
        });
    }

    /**
     * FeedKit Slider Class
     */
    class FeedKitSlider {
        constructor(container) {
            this.$container = $(container);
            this.$wrapper = this.$container.find('.rsvpkit-feedkit-wrapper');
            this.$slider = this.$container.find('.rsvpkit-feedkit-slider');
            this.$items = this.$slider.find('.rsvpkit-feedkit-item');
            this.$prevBtn = this.$container.find('.rsvpkit-feedkit-arrow-prev');
            this.$nextBtn = this.$container.find('.rsvpkit-feedkit-arrow-next');
            this.$dots = this.$container.find('.rsvpkit-feedkit-dot');

            // Settings from data attributes (responsive)
            this.slidesPerViewDesktop = parseInt(this.$container.data('slides-per-view')) || 3;
            this.slidesPerViewTablet = parseInt(this.$container.data('slides-per-view-tablet')) || 2;
            this.slidesPerViewMobile = parseInt(this.$container.data('slides-per-view-mobile')) || 1;

            // Slides to scroll (responsive)
            this.slidesToScrollDesktop = parseInt(this.$container.data('slides-to-scroll')) || 1;
            this.slidesToScrollTablet = parseInt(this.$container.data('slides-to-scroll-tablet')) || 1;
            this.slidesToScrollMobile = parseInt(this.$container.data('slides-to-scroll-mobile')) || 1;

            this.autoplay = this.$container.data('autoplay') === 'yes';
            this.displayDuration = parseInt(this.$container.data('display-duration')) || 4000;
            this.transitionDuration = parseInt(this.$container.data('transition-duration')) || 500;
            this.slideDirection = this.$container.data('slide-direction') || 'ltr';
            this.pauseOnHover = this.$container.data('pause-on-hover') === 'yes';
            this.infinite = this.$container.data('infinite') === 'yes';
            // Gap (responsive)
            const gd = parseInt(this.$container.data('gap'));
            this.gapDesktop = isNaN(gd) ? 20 : gd;
            const gt = parseInt(this.$container.data('gap-tablet'));
            this.gapTablet = isNaN(gt) ? this.gapDesktop : gt;
            const gm = parseInt(this.$container.data('gap-mobile'));
            this.gapMobile = isNaN(gm) ? this.gapTablet : gm;
            this.gap = this.gapDesktop;

            // State
            this.totalSlides = this.$items.length;
            this.slidesPerView = this.slidesPerViewDesktop;
            this.slidesToScroll = this.slidesToScrollDesktop;
            this.slideWidth = 0;
            this.autoplayInterval = null;
            this.isHovered = false;
            this.isTransitioning = false;

            // currentSlideIndex: in infinite mode, points into the 3-set array
            // where originals start at index = totalSlides
            // in non-infinite mode, 0-based index of first visible slide
            this.currentSlideIndex = 0;
            this.maxIndex = 0;

            this.init();
        }

        init() {
            if (this.totalSlides === 0) return;

            this.updateSlidesPerView();

            if (this.infinite) {
                this.setupClones();
                // Start at the beginning of the "originals" zone
                this.currentSlideIndex = this.totalSlides;
            } else {
                this.currentSlideIndex = 0;
            }

            this.bindEvents();
            this.updateSlider(false);

            if (this.autoplay) {
                this.startAutoplay();
            }
        }

        /**
         * Clone slides for seamless infinite loop.
         * Creates 3 sets: [Prepend Clones] [Originals] [Append Clones]
         */
        setupClones() {
            // Remove any existing clones first
            this.$slider.find('.rsvpkit-feedkit-clone').remove();

            const $originals = this.$slider.find('.rsvpkit-feedkit-item');

            // Prepend clones (in reverse so order is maintained)
            for (let i = $originals.length - 1; i >= 0; i--) {
                const $clone = $originals.eq(i).clone()
                    .addClass('rsvpkit-feedkit-clone')
                    .removeAttr('data-response-id');
                this.$slider.prepend($clone);
            }

            // Append clones
            $originals.each((i, el) => {
                const $clone = $(el).clone()
                    .addClass('rsvpkit-feedkit-clone')
                    .removeAttr('data-response-id');
                this.$slider.append($clone);
            });
        }

        bindEvents() {
            this.$prevBtn.on('click', () => this.prev());
            this.$nextBtn.on('click', () => this.next());

            this.$dots.on('click', (e) => {
                const index = $(e.currentTarget).data('index');
                this.goTo(index);
            });

            if (this.pauseOnHover && this.autoplay) {
                this.$container.on('mouseenter', () => {
                    this.isHovered = true;
                    this.stopAutoplay();
                });
                this.$container.on('mouseleave', () => {
                    this.isHovered = false;
                    this.startAutoplay();
                });
            }

            // Touch/swipe support
            let touchStartX = 0;
            this.$wrapper.on('touchstart', (e) => {
                touchStartX = e.originalEvent.touches[0].clientX;
            });
            this.$wrapper.on('touchend', (e) => {
                const diff = touchStartX - e.originalEvent.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) {
                    diff > 0 ? this.next() : this.prev();
                }
            });

            // Responsive resize
            $(window).on('resize', this.debounce(() => {
                this.updateSlidesPerView();
                this.updateSlider(false);
            }, 200));

            // Elementor editor: responsive device switch
            if (typeof elementorFrontend !== 'undefined') {
                $(document).on('elementor/device-mode/change', this.debounce(() => {
                    this.updateSlidesPerView();
                    this.updateSlider(false);
                }, 300));
            }
        }

        updateSlidesPerView() {
            // Determine current device mode
            let mode = 'desktop';

            // Use Elementor API if available (works in editor preview)
            if (typeof elementorFrontend !== 'undefined' && elementorFrontend.config) {
                const currentDevice = elementorFrontend.config.responsive?.currentDevice
                    || elementorFrontend.getCurrentDeviceMode?.();
                if (currentDevice === 'mobile' || currentDevice === 'mobile_extra') {
                    mode = 'mobile';
                } else if (currentDevice === 'tablet' || currentDevice === 'tablet_extra') {
                    mode = 'tablet';
                }
            } else {
                // Fallback: use window width for frontend
                const width = window.innerWidth;
                if (width <= 767) {
                    mode = 'mobile';
                } else if (width <= 1024) {
                    mode = 'tablet';
                }
            }

            if (mode === 'mobile') {
                this.slidesPerView = this.slidesPerViewMobile;
                this.slidesToScroll = this.slidesToScrollMobile;
                this.gap = this.gapMobile;
            } else if (mode === 'tablet') {
                this.slidesPerView = this.slidesPerViewTablet;
                this.slidesToScroll = this.slidesToScrollTablet;
                this.gap = this.gapTablet;
            } else {
                this.slidesPerView = this.slidesPerViewDesktop;
                this.slidesToScroll = this.slidesToScrollDesktop;
                this.gap = this.gapDesktop;
            }

            this.slidesToScroll = Math.min(this.slidesToScroll, this.slidesPerView);
            this.maxIndex = Math.max(0, this.totalSlides - this.slidesPerView);
        }

        updateSlider(animate = true) {
            const containerWidth = this.$wrapper.width();
            if (!containerWidth) return;

            // Sync CSS variable so grid column-gap matches items gap
            this.$container[0].style.setProperty('--feedkit-gap', `${this.gap}px`);

            const totalGaps = (this.slidesPerView - 1) * this.gap;
            const itemWidth = (containerWidth - totalGaps) / this.slidesPerView;
            this.slideWidth = itemWidth + this.gap;

            // Set gap on slider track (JS owns this for horizontal mode)
            this.$slider.css('gap', `${this.gap}px`);

            // Set widths on ALL items (originals + clones)
            this.$slider.find('.rsvpkit-feedkit-item').css({
                'flex': `0 0 ${itemWidth}px`,
                'max-width': `${itemWidth}px`,
                'box-sizing': 'border-box'
            });

            // Transition
            this.$slider.css('transition', animate
                ? `transform ${this.transitionDuration}ms ease-out`
                : 'none'
            );

            // Translate
            const translateX = -(this.currentSlideIndex * this.slideWidth);
            this.$slider.css('transform', `translateX(${translateX}px)`);

            // Update dots — map currentSlideIndex back to original index
            const originalIndex = this.infinite
                ? ((this.currentSlideIndex - this.totalSlides) % this.totalSlides + this.totalSlides) % this.totalSlides
                : this.currentSlideIndex;
            const dotIndex = this.slidesPerView > 0
                ? Math.min(Math.floor(originalIndex / this.slidesPerView), this.$dots.length - 1)
                : 0;
            this.$dots.removeClass('active');
            this.$dots.eq(Math.max(0, dotIndex)).addClass('active');

            // Arrow states (non-infinite only)
            if (!this.infinite) {
                this.$prevBtn.toggleClass('rsvpkit-nav-disabled', this.currentSlideIndex <= 0);
                this.$nextBtn.toggleClass('rsvpkit-nav-disabled', this.currentSlideIndex >= this.maxIndex);
            } else {
                this.$prevBtn.removeClass('rsvpkit-nav-disabled');
                this.$nextBtn.removeClass('rsvpkit-nav-disabled');
            }
        }

        next() {
            if (this.isTransitioning) return;

            if (this.infinite) {
                this.currentSlideIndex += this.slidesToScroll;
                this.animateSlide();
            } else {
                if (this.currentSlideIndex >= this.maxIndex) return;
                this.currentSlideIndex = Math.min(this.currentSlideIndex + this.slidesToScroll, this.maxIndex);
                this.animateSlide();
            }
        }

        prev() {
            if (this.isTransitioning) return;

            if (this.infinite) {
                this.currentSlideIndex -= this.slidesToScroll;
                this.animateSlide();
            } else {
                if (this.currentSlideIndex <= 0) return;
                this.currentSlideIndex = Math.max(this.currentSlideIndex - this.slidesToScroll, 0);
                this.animateSlide();
            }
        }

        animateSlide() {
            this.isTransitioning = true;
            this.updateSlider(true);

            setTimeout(() => {
                this.isTransitioning = false;

                if (this.infinite) {
                    // 3-set layout: [0..T-1 clones] [T..2T-1 originals] [2T..3T-1 clones]
                    // If we've scrolled into the append-clones zone, snap back to originals
                    if (this.currentSlideIndex >= this.totalSlides * 2) {
                        this.currentSlideIndex -= this.totalSlides;
                        this.updateSlider(false);
                    }
                    // If we've scrolled into the prepend-clones zone, snap forward to originals
                    else if (this.currentSlideIndex < this.totalSlides) {
                        this.currentSlideIndex += this.totalSlides;
                        this.updateSlider(false);
                    }
                }
            }, this.transitionDuration);
        }

        goTo(dotIndex) {
            if (this.isTransitioning) return;

            if (this.infinite) {
                // Convert dot (page) index to position within originals zone
                this.currentSlideIndex = this.totalSlides + (dotIndex * this.slidesPerView);
            } else {
                this.currentSlideIndex = Math.min(
                    Math.max(0, dotIndex * this.slidesPerView),
                    this.maxIndex
                );
            }
            this.animateSlide();
        }

        startAutoplay() {
            if (this.isHovered) return;

            this.stopAutoplay();
            this.autoplayInterval = setInterval(() => {
                // Slide direction determines auto-slide direction
                if (this.slideDirection === 'rtl') {
                    this.prev();
                } else {
                    this.next();
                }
            }, this.displayDuration);
        }

        stopAutoplay() {
            if (this.autoplayInterval) {
                clearInterval(this.autoplayInterval);
                this.autoplayInterval = null;
            }
        }

        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // Refresh slider (for real-time updates)
        refresh() {
            // Remove old clones, recapture originals
            this.$slider.find('.rsvpkit-feedkit-clone').remove();
            this.$items = this.$slider.find('.rsvpkit-feedkit-item');
            this.totalSlides = this.$items.length;
            this.maxIndex = Math.max(0, this.totalSlides - this.slidesPerView);

            if (this.infinite) {
                this.setupClones();
                // Reset to beginning of originals zone
                this.currentSlideIndex = this.totalSlides;
            } else {
                if (this.currentSlideIndex > this.maxIndex) {
                    this.currentSlideIndex = this.maxIndex;
                }
            }

            this.updateSlider(false);
        }
    }

    /**
     * FeedKit Real-time Updates Class
     */
    class FeedKitRealtime {
        constructor(container) {
            this.$container = $(container);
            this.$list = this.$container.find('.rsvpkit-feedkit-list, .rsvpkit-feedkit-slider');

            // Settings from data attributes
            this.postId = parseInt(this.$container.data('post-id')) || 0;
            this.enabled = this.$container.data('realtime') === 'yes';
            this.interval = parseInt(this.$container.data('realtime-interval')) || 15000;
            this.limit = parseInt(this.$container.data('limit')) || 10;
            this.filterStatus = this.$container.data('filter-status') || '';
            this.sortOrder = this.$container.data('sort-order') || 'DESC';

            // Display settings
            this.showAvatar = this.$container.data('show-avatar') === 'yes';
            this.showName = this.$container.data('show-name') === 'yes';
            this.showDate = this.$container.data('show-date') === 'yes';
            this.showMessage = this.$container.data('show-message') === 'yes';
            this.showBadge = this.$container.data('show-badge') === 'yes';

            // TAMBAHAN: Tarik label dinamis dari atribut HTML
            this.labelAttending = String(this.$container.data('label-attending') || window.rsvpkit_ajax?.strings?.status_attending || 'Hadir');
            this.labelNotAttending = String(this.$container.data('label-not-attendance') || window.rsvpkit_ajax?.strings?.status_not_attending || 'Tidak Hadir');
            this.labelNotSure = String(this.$container.data('label-notsure') || 'Ragu-ragu');

            // State
            this.pollingTimer = null;
            this.lastResponseIds = [];
            this.slider = null;

            // Capture initial response IDs
            this.captureCurrentIds();

            if (this.enabled && this.postId > 0) {
                this.startPolling();
            }

            // Listen for immediate refresh event from RSVP form submission
            const self = this;
            $(document).on('rsvpkit:response_submitted', function (e, detail) {
                // Only refresh if the submission is for the same post or post ID is unknown
                if (detail && detail.post_id && self.postId && detail.post_id !== self.postId) return;
                self.fetchResponses();
                // Reset polling timer to avoid redundant fetch shortly after instant refresh
                if (self.enabled && self.postId > 0) {
                    self.startPolling();
                }
            });
        }

        setSlider(slider) {
            this.slider = slider;
        }

        captureCurrentIds() {
            this.lastResponseIds = [];
            this.$list.find('.rsvpkit-feedkit-item').each((i, el) => {
                const id = $(el).data('response-id');
                if (id) {
                    this.lastResponseIds.push(id);
                }
            });
        }

        startPolling() {
            this.stopPolling();
            this.pollingTimer = setInterval(() => {
                this.fetchResponses();
            }, this.interval);
        }

        stopPolling() {
            if (this.pollingTimer) {
                clearInterval(this.pollingTimer);
                this.pollingTimer = null;
            }
        }

        fetchResponses() {
            if (!window.rsvpkit_ajax) return;

            $.ajax({
                url: rsvpkit_ajax.ajax_url,
                type: 'GET',
                data: {
                    action: 'rsvpkit_get_responses',
                    nonce: rsvpkit_ajax.responses ? rsvpkit_ajax.responses.nonce : '',
                    post_id: this.postId,
                    per_page: this.limit,
                    page: 1,
                    attendance_status: this.filterStatus
                },
                success: (response) => {
                    try {
                        const data = typeof response === 'string' ? JSON.parse(response) : response;
                        if (data.success && data.responses) {
                            this.updateDisplay(data.responses);
                        }
                    } catch (e) {
                        console.error('FeedKit: Error parsing response', e);
                    }
                },
                error: (xhr, status, error) => {
                    console.error('FeedKit: AJAX error', error);
                }
            });
        }

        updateDisplay(responses) {
            // Check if there are new responses
            const newIds = responses.map(r => r.id);
            const hasNewData = !this.arraysEqual(newIds, this.lastResponseIds);

            if (!hasNewData) return;

            // Clear existing items (except empty state)
            this.$list.find('.rsvpkit-feedkit-item').remove();
            this.$list.find('.rsvpkit-feedkit-empty').remove();

            if (responses.length === 0) {
                this.$list.append('<div class="rsvpkit-feedkit-empty">No responses yet.</div>');
            } else {
                // Render new responses with animation
                responses.forEach((response, index) => {
                    const $item = this.renderResponseItem(response);
                    $item.addClass('new-entry');
                    this.$list.append($item);
                });
            }

            // Update tracked IDs
            this.lastResponseIds = newIds;

            // Refresh slider if in horizontal mode
            if (this.slider) {
                this.slider.refresh();
            }
        }

        renderResponseItem(response) {
            const initials = this.getInitials(response.guest_name);
            
            // LOGIKA BARU 3 ARAH
            let badgeClass = 'not-sure';
            let badgeText = this.labelNotSure;

            if (response.attendance_status === 'attending') {
                badgeClass = 'attending';
                badgeText = this.labelAttending;
            } else if (response.attendance_status === 'not_attending') {
                badgeClass = 'not-attending';
                badgeText = this.labelNotAttending;
            }

            // Format date client-side to match user's local timezone
            const isoDate = response.created_at_iso || response.created_at; // Fallback
            const dateStr = formatClientDate(isoDate);
            const dateHtml = `<span class="rsvpkit-client-time" data-iso="${isoDate}">${dateStr}</span>`;

            let html = `<div class="rsvpkit-feedkit-item" data-response-id="${response.id}">`;
            html += '<div class="rsvpkit-feedkit-header">';

            if (this.showAvatar) {
                html += `<div class="rsvpkit-feedkit-avatar">${initials}</div>`;
            }

            html += '<div class="rsvpkit-feedkit-meta">';
            if (this.showName) {
                html += `<div class="rsvpkit-feedkit-name">${this.escapeHtml(response.guest_name)}</div>`;
            }
            if (this.showDate) {
                html += `<div class="rsvpkit-feedkit-date">${dateHtml}</div>`;
            }
            html += '</div>';

            if (this.showBadge) {
                html += `<span class="rsvpkit-feedkit-badge ${badgeClass}">${badgeText}</span>`;
            }

            html += '</div>';

            if (this.showMessage && response.message) {
                html += `<div class="rsvpkit-feedkit-message">${this.escapeHtml(response.message)}</div>`;
            }

            html += '</div>';

            return $(html);
        }

        getInitials(name) {
            const words = name.trim().split(' ');
            if (words.length >= 2) {
                return (words[0][0] + words[1][0]).toUpperCase();
            }
            return name.substring(0, 2).toUpperCase();
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        arraysEqual(a, b) {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) return false;
            }
            return true;
        }
    }

    /**
     * FeedKit Lazy Load Class
     * Handles Load More and Pagination for vertical mode
     */
    class FeedKitLazyLoad {
        constructor(container) {
            this.$container = $(container);
            this.$list = this.$container.find('.rsvpkit-feedkit-list');
            this.$navControls = this.$container.find('.rsvpkit-feedkit-nav-controls');

            // Read settings from data attributes
            this.postId = parseInt(this.$container.data('post-id')) || 0;
            this.mode = String(this.$container.data('feed-nav-mode') || 'none');
            this.perPage = parseInt(this.$container.data('feed-per-page')) || 10;
            this.totalLimit = parseInt(this.$container.data('limit')) || 50;
            this.filterStatus = String(this.$container.data('filter-status') || '');
            this.sortOrder = String(this.$container.data('sort-order') || 'DESC');

            // Display settings (for rendering via JS)
            this.showAvatar = this.$container.data('show-avatar') === 'yes';
            this.showName = this.$container.data('show-name') === 'yes';
            this.showDate = this.$container.data('show-date') === 'yes';
            this.showMessage = this.$container.data('show-message') === 'yes';
            this.showBadge = this.$container.data('show-badge') === 'yes';

            // Custom labels
            this.labelLoadMore = String(this.$container.data('label-load-more') || 'Load More');
            this.labelPrev = String(this.$container.data('label-prev') || 'Prev');
            this.labelNext = String(this.$container.data('label-next') || 'Next');
            
            // TAMBAHAN: Tarik label dinamis dari atribut HTML
            this.labelAttending = String(this.$container.data('label-attending') || window.rsvpkit_ajax?.strings?.status_attending || 'Hadir');
            this.labelNotAttending = String(this.$container.data('label-not-attendance') || window.rsvpkit_ajax?.strings?.status_not_attending || 'Tidak Hadir');
            this.labelNotSure = String(this.$container.data('label-notsure') || 'Ragu-ragu');

            // State
            this.page = 1;
            this.total = parseInt(this.$navControls.data('total')) || 0;
            this.loading = false;

            // Don't initialize if mode is 'none' or no nav controls
            if (this.mode === 'none' || !this.$navControls.length) return;

            this.initControls();
            this.updateControls();
        }

        initControls() {
            if (this.mode === 'load_more') {
                this.$loadMore = this.$navControls.find('.rsvpkit-feedkit-load-more');
                this.$loadMore.on('click', () => this.loadMore());
            } else if (this.mode === 'pagination') {
                this.$pagination = this.$navControls.find('.rsvpkit-feedkit-pagination');
                this.$prev = this.$navControls.find('.rsvpkit-feedkit-page-prev');
                this.$next = this.$navControls.find('.rsvpkit-feedkit-page-next');
                this.$pageNumbers = this.$navControls.find('.rsvpkit-feedkit-page-numbers');
                this.$pageInfo = this.$navControls.find('.rsvpkit-feedkit-page-info');

                this.$prev.on('click', () => this.goToPage(this.page - 1));
                this.$next.on('click', () => this.goToPage(this.page + 1));
                // Delegate click on page number buttons
                this.$pageNumbers.on('click', '.rsvpkit-feedkit-page-num', (e) => {
                    const p = parseInt($(e.currentTarget).data('page'));
                    if (p && p !== this.page) this.goToPage(p);
                });
            }
        }

        apiFetch(page) {
            if (!window.rsvpkit_ajax) return $.Deferred().reject().promise();

            return $.ajax({
                url: rsvpkit_ajax.ajax_url,
                type: 'GET',
                data: {
                    action: 'rsvpkit_get_responses',
                    nonce: rsvpkit_ajax.responses ? rsvpkit_ajax.responses.nonce : '',
                    post_id: this.postId,
                    page: page,
                    per_page: this.perPage,
                    attendance_status: this.filterStatus
                }
            }).then((response) => {
                const data = typeof response === 'string' ? JSON.parse(response) : response;
                if (!data.success) throw new Error('Failed to load responses');
                return data;
            });
        }

        loadMore() {
            if (this.loading) return;
            const totalPages = Math.ceil(this.total / this.perPage);
            if (this.page >= totalPages) return;

            this.loading = true;
            this.$loadMore.addClass('loading').prop('disabled', true);

            this.apiFetch(this.page + 1).then((data) => {
                this.page = data.pagination.current_page;
                this.total = Math.min(data.pagination.total_responses, this.totalLimit);
                this.renderItems(data.responses, false);
                this.updateControls();
            }).catch((err) => {
                console.error('FeedKit LazyLoad: Error loading more responses', err);
            }).always(() => {
                this.loading = false;
                this.$loadMore.removeClass('loading').prop('disabled', false);
            });
        }

        goToPage(page) {
            if (this.loading) return;
            const totalPages = Math.max(1, Math.ceil(this.total / this.perPage));
            if (page < 1 || page > totalPages) return;

            this.loading = true;
            this.$container.find('.rsvpkit-feedkit-list').addClass('feedkit-loading');

            this.apiFetch(page).then((data) => {
                this.page = data.pagination.current_page;
                this.total = Math.min(data.pagination.total_responses, this.totalLimit);
                this.renderItems(data.responses, true);
                this.updateControls();
                // Scroll back to top of widget for better UX
                const containerTop = this.$container.offset().top;
                if ($(window).scrollTop() > containerTop) {
                    $('html, body').animate({ scrollTop: containerTop - 50 }, 300);
                }
            }).catch((err) => {
                console.error('FeedKit LazyLoad: Error loading page', err);
            }).always(() => {
                this.loading = false;
                this.$container.find('.rsvpkit-feedkit-list').removeClass('feedkit-loading');
            });
        }

        renderItems(responses, replace) {
            const items = responses.map(r => this.renderResponseItem(r));
            const html = items.map(el => el.prop('outerHTML')).join('');

            if (replace) {
                this.$list.find('.rsvpkit-feedkit-item').remove();
                this.$list.find('.rsvpkit-feedkit-empty').remove();
                this.$list.prepend(html);
            } else {
                this.$list.append(html);
            }

            // Apply client-side time formatting to newly added items
            initClientTimeFormatting(this.$list);
        }

        renderResponseItem(response) {
            const initials = this.getInitials(response.guest_name);
            
            // LOGIKA BARU 3 ARAH
            let badgeClass = 'not-sure';
            let badgeText = this.labelNotSure;

            if (response.attendance_status === 'attending') {
                badgeClass = 'attending';
                badgeText = this.labelAttending;
            } else if (response.attendance_status === 'not_attending') {
                badgeClass = 'not-attending';
                badgeText = this.labelNotAttending;
            }

            const isoDate = response.created_at_iso || response.created_at;
            const dateStr = formatClientDate(isoDate);
            const dateHtml = `<span class="rsvpkit-client-time" data-iso="${isoDate}">${dateStr}</span>`;

            let html = `<div class="rsvpkit-feedkit-item" data-response-id="${response.id}">`;
            html += '<div class="rsvpkit-feedkit-header">';

            if (this.showAvatar) {
                html += `<div class="rsvpkit-feedkit-avatar">${this.escapeHtml(initials)}</div>`;
            }

            html += '<div class="rsvpkit-feedkit-meta">';
            if (this.showName) {
                html += `<div class="rsvpkit-feedkit-name">${this.escapeHtml(response.guest_name)}</div>`;
            }
            if (this.showDate) {
                html += `<div class="rsvpkit-feedkit-date">${dateHtml}</div>`;
            }
            html += '</div>';

            if (this.showBadge) {
                html += `<span class="rsvpkit-feedkit-badge ${badgeClass}">${this.escapeHtml(badgeText)}</span>`;
            }

            html += '</div>';

            if (this.showMessage && response.message) {
                html += `<div class="rsvpkit-feedkit-message">${this.escapeHtml(response.message)}</div>`;
            }

            html += '</div>';
            return $(html);
        }

        updateControls() {
            const totalPages = Math.max(1, Math.ceil(this.total / this.perPage));

            if (this.mode === 'load_more') {
                if (this.page >= totalPages || this.total <= this.perPage) {
                    this.$loadMore.hide();
                } else {
                    this.$loadMore.show();
                }
            } else if (this.mode === 'pagination') {
                // Prev/Next buttons — use custom labels
                this.$prev.html('&laquo; ' + this.escapeHtml(this.labelPrev)).toggle(this.page > 1);
                this.$next.html(this.escapeHtml(this.labelNext) + ' &raquo;').toggle(this.page < totalPages);

                // Build page number buttons (3-number window like RSVPKit main widget)
                this.$pageNumbers.empty();
                if (totalPages > 1) {
                    const range = this.computeWindow(this.page, totalPages);
                    for (let p = range.start; p <= range.end; p++) {
                        const $btn = $('<button type="button" class="rsvpkit-feedkit-page-num"></button>')
                            .text(p)
                            .attr('data-page', p)
                            .attr('aria-label', 'Page ' + p);
                        if (p === this.page) {
                            $btn.addClass('active').attr('aria-current', 'page');
                        }
                        this.$pageNumbers.append($btn);
                    }
                }

                this.$pageInfo.text('').hide();
            }
        }

        computeWindow(page, total) {
            const t = Math.max(1, total);
            if (t <= 3) return { start: 1, end: t };
            if (page <= 2) return { start: 1, end: 3 };
            if (page >= t - 1) return { start: t - 2, end: t };
            return { start: page - 1, end: page + 1 };
        }

        getInitials(name) {
            const words = (name || '').trim().split(' ');
            if (words.length >= 2) {
                return (words[0][0] + words[1][0]).toUpperCase();
            }
            return (name || '').substring(0, 2).toUpperCase();
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text || '';
            return div.innerHTML;
        }
    }

    /**
     * Initialize Feed Kit widgets
     */
    function initFeedKitWidgets($scope) {
        // Initialize client-side time formatting
        initClientTimeFormatting($scope);

        const $container = $scope ? $scope.find('.rsvpkit-feedkit-container') : $('.rsvpkit-feedkit-container');

        $container.each(function () {
            const $this = $(this);
            let slider = null;
            let realtime = null;

            // Initialize slider for horizontal mode
            if ($this.hasClass('mode-horizontal') && !$this.data('feedkit-slider-initialized')) {
                slider = new FeedKitSlider(this);
                $this.data('feedkit-slider-initialized', true);
                $this.data('feedkit-slider', slider);
            }

            // Initialize lazy load for vertical mode
            if ($this.hasClass('mode-vertical') && !$this.data('feedkit-lazyload-initialized')) {
                const navMode = String($this.data('feed-nav-mode') || 'none');
                if (navMode !== 'none') {
                    const lazyLoad = new FeedKitLazyLoad(this);
                    $this.data('feedkit-lazyload-initialized', true);
                    $this.data('feedkit-lazyload', lazyLoad);
                }
            }

            // Initialize real-time updates
            if (!$this.data('feedkit-realtime-initialized')) {
                realtime = new FeedKitRealtime(this);
                $this.data('feedkit-realtime-initialized', true);

                // Link slider to realtime for refresh
                if (slider) {
                    realtime.setSlider(slider);
                }
            }
        });
    }

    // Initialize on document ready
    $(document).ready(function () {
        initFeedKitWidgets();
    });

    // Initialize on Elementor frontend init
    $(window).on('elementor/frontend/init', function () {
        if (typeof elementorFrontend !== 'undefined') {
            elementorFrontend.hooks.addAction('frontend/element_ready/rsvpkit-feedkit.default', function ($scope) {
                initFeedKitWidgets($scope);
            });
        }
    });

})(jQuery);
