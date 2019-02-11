$(function () {


  window.site = {};

  window.site.form = ({

    init: function () {

      var _th = this;

      $('.js-phone').mask('+7(999) 999-9999');

      $('form').submit(function () {
        if (!_th.checkForm($(this)))
          return false;
      });
    },

    checkForm: function (form) {
      var checkResult = true;
      form.find('.warning').removeClass('warning');
      form.find('input, textarea, select').each(function () {
        if ($(this).data('req')) {
          switch ($(this).data('type')) {
            case 'tel':
              var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
              if (!re.test($(this).val())) {
                $(this).addClass('warning');
                checkResult = false;
              }
              break;
            case 'email':
              var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
              if (!re.test($(this).val())) {
                $(this).addClass('warning');
                checkResult = false;
              }
              break;
            case 'checkbox_personal':
              if (!$(this).is(':checked')) {
                $(this).parents('.checkbox').addClass('warning');
                checkResult = false;
              }
              break;
            default:
              if ($.trim($(this).val()) === '') {
                $(this).addClass('warning');
                checkResult = false;
              }
              break;
          }
        }
      });
      return checkResult;
    }

  }).init();

  window.site.obj = ({

    map: function () {

      let $map = $('.js-map'),
        coords = $map.data('coords').split(',');

      ymaps.ready(function () {

        let myMap = new ymaps.Map("yaMap", {
          center: [coords[0], coords[1]],
          zoom: $map.data('zoom') || 14,
          controls: ['largeMapDefaultSet']
        });

        myMap.controls.add('zoomControl', {
          size: 'small'
        });

        myMap.behaviors.disable('scrollZoom');

        let myPlacemark = new ymaps.Placemark(coords, {}, {
          iconLayout: 'default#image',
          iconImageHref: 'static/img/pin.png',
          iconImageSize: [50, 66]
        });

        myMap.geoObjects.add(myPlacemark);

      });

      return;
    },

    tabs: function () {
      $('.imodels__tabs-nav-btn').on('click', function () {
        let _t = $(this),
          _tData = _t.data('tabs-nav'),
          _tPar = _t.parents('.js-tabs'),
          tabs = _tPar.find('.imodels__tabs-item'),
          btn = _tPar.find('.imodels__tabs-nav-btn');

          if (!_t.hasClass('imodels__tabs-nav-btn--active')) {
            btn.removeClass('imodels__tabs-nav-btn--active');
            _t.addClass('imodels__tabs-nav-btn--active');
            tabs.fadeOut(350);
            setTimeout(function() {
              tabs.removeClass('imodels__tabs-nav-btn--active');
              _tPar.find('.imodels__tabs-item[data-tabs-item="'+_tData+'"]').fadeIn(350);
            }, 350);
          }

        return false;
      });

    },

    init: function () {
      let _th = this,
        $body = $('body');

      //check ios
      if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
        $body.addClass('ios');
      }

      if ($('.js-map').length) {
        _th.map();
      }

      if ($('.js-tabs').length) {
        _th.tabs();
      }

      if ($('.js-swiper-icar').length) {
        let iplusesSlider = new Swiper('.js-swiper-icar', {
          loop: false,
          speed: 750,
          slidesPerView: 3,
          spaceBetween: 84,
          mousewheel: false,
          grabCursor: false,
          keyboard: false,
          simulateTouch: false,
          allowSwipeToNext: false,
          allowSwipeToPrev: false,
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          breakpoints: {
            991: {
              slidesPerView: 1,
              spaceBetween: 0,
              autoHeight: true
            }
          }
        });
      }

      if ($('.js-mfp').length) {
        $('.js-mfp').magnificPopup({
          type: 'inline',
          midClick: true,
          callbacks: {
            open: function () {}
          }
        });
      }

      $('.js-close-popup').on('click', function () {
        $.magnificPopup.close();
        return false;
      });

      if ($('.js-burger').length) {
        $('.js-burger').on('click', function () {
          let _t = $(this),
            menu = $('.nav');

          if (!_t.hasClass('header__burger--active')) {
            _t.addClass('header__burger--active');
            $body.addClass('open-menu');
            menu.fadeIn(350);
          } else {
            _t.removeClass('header__burger--active');
            menu.fadeOut(350);
            $body.removeClass('open-menu');

          }
          return false;
        });
      }

      if ($('.js-select').length) {
        $('.js-select').styler({
          selectSmartPositioning: false,
          onFormStyled: function () {}
        });
      }

      $(document).on('click', function (e) {
        if (!$(e.target).closest(".new-class").length) {
          e.stopPropagation();
        }
      });

      return this;
    }

  }).init();

});
