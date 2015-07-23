(function(){
  'use strict';

  // Prepare the 'games' module for subsequent registration of controllers and delegates
  angular.module('games', [ 'ngMaterial' ]);


angular
.module('games', [])
.directive('printDiv', function () {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            var iframe;
            var elementToPrint = document.querySelector(attrs.printDiv);

            if (!window.frames["print-frame"]) {
                var elm = document.createElement('iframe');
                elm.setAttribute('id', 'print-frame');
                elm.setAttribute('name', 'print-frame');
                elm.setAttribute('style', 'display: none;');
                document.body.appendChild(elm);
            }

            function write(value) {
                var doc;
                if (iframe.contentDocument) { // DOM
                    doc = iframe.contentDocument;
                } else if (iframe.contentWindow) { // IE win
                    doc = iframe.contentWindow.document;
                } else {
                    alert('Wonder what browser this is... ' + navigator.userAgent);
                }
                doc.write(value);
                doc.close();
            }

            element.bind('click', function(event) {
                iframe = document.getElementById('print-frame');
                write(elementToPrint.innerHTML);

                if (window.navigator.userAgent.indexOf ("MSIE") > 0) {
                    iframe.contentWindow.document.execCommand('print', false, null);
                } else {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                }
            });
        }
    };
});

})();
