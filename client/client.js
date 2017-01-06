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
        localCtrl.addSoundModule = addSoundModule;
        localCtrl.toggleCollapsed = toggleCollapsed;
        localCtrl.removeAudio = removeAudio;
        localCtrl.addModule = addModule;

        $http({
            method: 'GET',
            url: '/get/json'
        }).then(function successCallback(response) {
            console.log(response.data)
            localCtrl.localisedAudio = response.data;
        }, function errorCallback(response) {
            console.log(response)
        });

        function addModule (moduleName) {
            var data = {};
            data[moduleName] = {};
            return $http({
                method: 'POST',
                url: '/add/module',
                data : data
            }).then(function(response){
                localCtrl.localisedAudio[moduleName] = response.data[moduleName];
                console.log("Success : ", response)
                $('#moduleModal').modal('hide')
            }, function(error){
                console.log(error)
            })
        }

        function removeAudio(moduleKey, audioKey, langKey) {

            return $http({
                method: 'DELETE',
                url: '/delete/sound',
                data : {
                    module : moduleKey,
                    audio : audioKey,
                    lang : langKey
                }
            }).then(function(response){
                delete localCtrl.localisedAudio[moduleKey][audioKey]["lang"][langKey];
                console.log("Success : ", response)
            }, function(error){
                console.log(error)
            })
        }

        function uploadAudio(moduleKey, audioKey, language) {
            fileUpload.uploadFileToUrl(localCtrl.audio.file, "/add/file")
            .then(function(response){
                return $http({
                    method: 'PUT',
                    url: '/add/langaudio',
                    data : {
                        module : moduleKey,
                        audio : audioKey,
                        language : language,
                        filename : response.data.filename
                    }
                })
            })
            .then(function(response){
                console.log(response.data)
                $('#'+audioKey).collapse('toggle');
                localCtrl.localisedAudio[moduleKey][audioKey]["lang"][language] = response.data[moduleKey][audioKey]["lang"][language];
            }, function(error){
                console.log(error)
            })
        }

        function addSoundModule(soundModule) {
            var data = {}
            data["module"] = soundModule.moduleName;
            data["soundModule"] = {};
            data.soundModule[soundModule.soundKey] = {
                label : soundModule.label,
                lang : {}
            }
            return $http({
                method: 'PUT',
                url: '/add/soundmodule',
                data : data
            }).then(function(response){
                localCtrl.localisedAudio[soundModule.moduleName] = response.data[soundModule.moduleName];
                console.log("Success : ", response)
                $('#soundModal').modal('hide')
            },function(error){
                console.log(error)
            })
        }

        function toggleCollapsed(id) {
            $('#'+id).collapse('toggle');
        }
    }
})();
