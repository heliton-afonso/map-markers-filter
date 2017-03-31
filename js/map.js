var map;
var markers = [];
var levelWindowInfo = 0;
var urlBaseIcon = "../images/";
var currentWindow = false;
var visibles = ['green','yellow','red'];

$(document).ready(function() {
  // Begin filter client by name
  $('#client_name').on('blur', function() {
    filterMarkers();
  });

  $('#btn-search').on('click', function() {
    filterMarkers();
  });
  // End filter client by name

  // Begin filter client by type
  $('#type').on('change', function() {
    filterMarkers();
  });
  // End filter client by type

  // Begin filter client by color
  $('input.chk-color').on('change', function(e) {
    var $this = $(this),
    color = $this.val();

    if ($this.is(':checked')) {
      // If checked, add to our list of visible
      visibles.push(color);
    } else {
      // Otherwise, it does not add to our list of visible
      visibles.splice(visibles.indexOf(color), 1);
    }

    filterMarkers();
  });
  // End filter client by color
});

// Main method to be invoked for map loading
function initMap() {
  var s = document.createElement("script");
  s.type = "text/javascript";
  s.src = "../js/infobox.js";
  $("head").append(s);

  var LatLng = {lat: -14, lng: -54.5};

  map = new google.maps.Map(document.getElementById('map'), {
    center: LatLng,
    zoom: 5,
    mapTypeId: 'roadmap'
  });

  // Marker options available for display on the map
  var icons = {
    zebu: {
      green: {
        icon: urlBaseIcon + 'marcador-zebu-verde.png'
      },
      yellow: {
        icon: urlBaseIcon + 'marcador-zebu-amarelo.png'
      },
      red: {
        icon: urlBaseIcon + 'marcador-zebu-vermelho.png'
      }
    },
    semem: {
      green: {
        icon: urlBaseIcon + 'marcador-semem-verde.png'
      },
      yellow: {
        icon: urlBaseIcon + 'marcador-semem-amarelo.png'
      },
      red: {
        icon: urlBaseIcon + 'marcador-semem-vermelho.png'
      }
    }
  };
  
  function loadMarkers() {
    $.getJSON('../data/data.json', function(points) {
      $.each(points, function(index, point) {
        var marker = new google.maps.Marker({
          map: map,
          position: new google.maps.LatLng(point.latitude, point.longitude),
          icon: icons[point.type][point.color].icon,
          id: point.id,
          type: point.type,
          color: point.color,
          title: point.client
        });
        
        markers.push(marker);

        var content = "";
        content += '<div id="iw-container">';
        content += ' <div class="iw-title">' + point.client + '</div>';
        content += ' <div class="iw-content">';
        if(point.address != "") {
          content += '   <hr />';
          content += '   <div class="iw-subTitle">Endereço</div>';
          content += '   <p>' + point.address + '</p>';
        }
        if(point.phone1 != "" || point.phone2 != "" || point.phone3 != "") {
          content += '   <hr />';
          content += '   <div class="iw-subTitle">Telefones:</div>';
          if(point.phone1 != "") {
            content += '   <p>' + point.phone1 + '</p>';
          }
          if(point.phone2 != "") {
            content += '   <p>' + point.phone2 + '</p>';
          }
          if(point.phone3 != "") {
            content += '   <p>' + point.phone3 + '</p>';
          }
        }
        if(point.contact != "") {
          content += '   <hr />';
          content += '   <div class="iw-subTitle">Contato</div>';
          content += '   <p>' + point.contact + '</p>';
        }
        if(point.last_purchase_date != "") {
          content += '   <hr />';
          content += '   <div class="iw-subTitle">Data Última Compra:</div>';
          content += '   <p>' + point.last_purchase_date + '</p>';
        }
        content += ' </div>';
        content += '</div>';

        var windowInfo = new google.maps.InfoWindow({
          content: content
        });

        marker.addListener('click', function() {
          windowInfo.setZIndex(++levelWindowInfo);

          if( currentWindow )
            currentWindow.close();

          currentWindow = windowInfo;

          windowInfo.open(map, marker);
        });

        // Start Customizing the Content Viewer
        google.maps.event.addListener(windowInfo, 'domready', function() {
          // Reference to DIV involving the background of the information window
          var iwOuter = $('.gm-style-iw');
          var iwBackground = iwOuter.prev();

          // Remove the white shadow from the DIV
          iwBackground.children(':nth-child(2)').css({'display' : 'none'});

          // Remove white background from DIV
          iwBackground.children(':nth-child(4)').css({'display' : 'none'});

          // Moves the info window to 115px to the right.
          iwOuter.parent().parent().css({left: '115px'});

          // Moves the arrow shadow 76px to the left margin.
          iwBackground.children(':nth-child(1)').attr('style', function(i,s){ return s + 'left: 76px !important;'});

          // Moves the arrow 76px to the left margin.
          iwBackground.children(':nth-child(3)').attr('style', function(i,s){ return s + 'left: 76px !important;'});

          // Changes the shadow color of the back of the main div.
          iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index' : '1'});

          // Reference to div that groups the elements of the Close button.
          var iwCloseBtn = iwOuter.next();

          // Apply the desired effect to the Close button
          iwCloseBtn.css({opacity: '1', right: '47px', top: '8px', 'box-shadow': 'rgb(116, 116, 116) 0px 0px 5px'});

          // The API automatically applies 0.7 opacity to the button after the mouseout event. This function reverses this event to the desired value.
          iwCloseBtn.mouseout(function(){
            $(this).css({opacity: '1'});
          });
        });
        // End Customizing the Content Viewer
      });
    });
  }

  loadMarkers();
}

function filterMarkers() {
  var type_filter = $('#type').val();
  var client_name_filter = removeAccents($('#client_name').val().toUpperCase());

  for (var i = 0, length = markers.length; i < length; i++) {
    if(type_filter === 'todos') {
      markers[i].setVisible(visibles.indexOf(markers[i].color) !== -1 && (removeAccents(markers[i].title.toUpperCase()).search(client_name_filter) !== -1));
    } else {
      markers[i].setVisible(visibles.indexOf(markers[i].color) !== -1 && type_filter === markers[i].type && (removeAccents(markers[i].title.toUpperCase()).search(client_name_filter) !== -1));
    }
  }
}

function removeAccents(str) {
  str = str.replace(/[ÀÁÂÃÄÅ]/,"A");
  str = str.replace(/[ÈÉÊË]/,"E");
  str = str.replace(/[ÌÍÎÏ]/,"I");
  str = str.replace(/[ÒÓÔÕÖ]/,"O");
  str = str.replace(/[ÙÚÛÜ]/,"U");
  str = str.replace(/[Ç]/,"C");

  return str.replace(/[^a-z0-9]/gi,''); 
}