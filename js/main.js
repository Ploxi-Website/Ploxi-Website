(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 45) {
            $('.navbar').addClass('sticky-top shadow-sm');
        } else {
            $('.navbar').removeClass('sticky-top shadow-sm');
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 0, 'easeInOutExpo');
        return false;
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: true,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ],
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });


    // Client carousel
    $(".client-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 90,
        dots: false,
        loop: true,
        nav : false,
        responsive: {
            0:{
                items:2
            },
            576:{
                items:3
            },
            768:{
                items:4
            },
            992:{
                items:5
            },
            1200:{
                items:6
            }
        }
    });
    
})(jQuery);

// Initialize static map (no zoom)
new svgMap({
  targetElementID: 'svgMap',
  
  // Greenish color scheme
  colorMax: '#b8e6d5',
  colorMin: '#e8f5f1',
  colorNoData: '#d4ebe5',
  
  // DISABLE zoom
  mouseWheelZoomEnabled: false,
  
  data: {
    data: {
      presence: { name: '', format: '' }
    },
    applyData: 'presence',
    values: {}
  }
});

// Add custom pins after map loads
setTimeout(function() {
  const mapWrapper = document.querySelector('#svgMap');
  
  // Pin data
  const pins = [
    {
      top: '42%', left: '72%',
      country: 'India',
      image: 'img/place.png',
      offices: 'Head Quaters',
      year: 'registered in 2024',
    },
    {
      top: '76%', left: '85%',
      country: 'Australia',
      image: 'img/place1.png',
      offices: 'Tech & Finance Support for APAC',
      year:''
    },
    {
      top: '41.5%', left: '64.5%',
      country: 'UAE',
      image: 'img/place2.png',
      offices: 'Global Offices',
      year: 'registering in 2026',
    }
  ];
  
  pins.forEach(function(pin) {
    // Create pin container
    const pinDiv = document.createElement('div');
    pinDiv.className = 'location-pin';
    pinDiv.style.position = 'absolute';
    pinDiv.style.top = pin.top;
    pinDiv.style.left = pin.left;
    pinDiv.style.transform = 'translate(-50%, -100%)';
    
    // Pin HTML
    pinDiv.innerHTML = `
      <div class="pin-wrapper">
        <div class="pin-marker">
          <img src="${pin.image}" alt="${pin.country}" class="pin-image">
        </div>
        <div class="pin-tooltip">
          <strong>${pin.country}</strong><br>
          <small>${pin.offices} | ${pin.year} </small><br>
        </div>
      </div>
    `;
    
    mapWrapper.appendChild(pinDiv);
  });
}, 500);


