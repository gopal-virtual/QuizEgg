(function() {
    'use strict';

    angular
        .module('localisedAudio', []);
})();
(function() {
    'use strict';

    angular
        .module('localisedAudio')
        .service('fileUpload', fileUpload);

    fileUpload.$inject = ['$http'];

    /* @ngInject */
    function fileUpload($http) {
        this.uploadFileToUrl = uploadFileToUrl;

        function uploadFileToUrl(file, uploadUrl, callback) {
            var fd = new FormData();
            fd.append('audioFile', file[0]);
            return $http.post(
                uploadUrl,
                fd,
                {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                }
            )
        }
    }
})();
(function() {
    'use strict';

    angular
        .module('localisedAudio')
        .controller('LocalisedController', LocalisedController);

    LocalisedController.$inject = ['$http','fileUpload'];

    /* @ngInject */
    function LocalisedController($http, fileUpload) {
        var localCtrl = this;
        localCtrl.uploadAudio = uploadAudio;
        $http({
            method: 'GET',
            url: '/get/json'
        }).then(function successCallback(response) {
            console.log(response.data)
            localCtrl.localisedAudio = response.data;
        }, function errorCallback(response) {
            console.log(response)
        });

        function uploadAudio(moduleKey, audioKey) {
            fileUpload.uploadFileToUrl(localCtrl.audio.file, "/api/file")
            .then(function(response){
                return $http({
                    method: 'PUT',
                    url: '/update/audio',
                    data : {
                        module : moduleKey,
                        audio : audioKey,
                        language : localCtrl.audio.language,
                        filename : response.data.filename
                    }
                })
            })
        }
    }
})();
