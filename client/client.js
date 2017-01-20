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
        localCtrl.uploadText = uploadText;
        localCtrl.addSoundModule = addSoundModule;
        localCtrl.toggleCollapsed = toggleCollapsed;
        localCtrl.removeAudio = removeAudio;
        localCtrl.removeText = removeText;
        localCtrl.addModule = addModule;
        localCtrl.removeSpace = removeSpace;
        localCtrl.language = {
            'hi' : 'hindi',
            'ta' : 'tamil',
            'gu' : 'gujarati',
            'te' : 'telugu',
            'bn' : 'bengali',
            'kn' : 'kannada',
            'mr' : 'marathi'
        }

        $http({
            method: 'GET',
            url: '/get/json'
        }).then(function successCallback(response) {
            console.log(response.data)
            localCtrl.localisedAudio = response.data;
        }, function errorCallback(response) {
            console.log(response)
        });

        $http({
            method: 'GET',
            url: '/get/textjson'
        }).then(function successCallback(response) {
            console.log(response.data)
            localCtrl.localisedText = response.data;
        }, function errorCallback(response) {
            console.log(response)
        });

        function removeSpace (string) {
            return string.replace(/\s+/g, '');
        }
        function addModule (moduleName) {
            var data = {};
            data[moduleName] = {};
            return $http({
                method: 'POST',
                url: '/add/module',
                data : data
            }).then(function(response){
                localCtrl.localisedAudio[moduleName] = response.data[moduleName];
                console.log('Success : ', response)
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
                delete localCtrl.localisedAudio[moduleKey][audioKey]['lang'][langKey];
                console.log('Success : ', response)
            }, function(error){
                console.log(error)
            })
        }
        function removeText(moduleKey, textKey, langKey) {

            return $http({
                method: 'DELETE',
                url: '/delete/text',
                data : {
                    module : moduleKey,
                    text : textKey,
                    lang : langKey
                }
            }).then(function(response){
                delete localCtrl.localisedText[moduleKey][textKey]['lang'][langKey];
                console.log('Success : ', response)
            }, function(error){
                console.log(error)
            })
        }

        function uploadAudio(moduleKey, audioKey, language, event) {
            console.log(event.target)
            fileUpload.uploadFileToUrl(localCtrl.audio.file, '/add/file')
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
                var id = '#' + localCtrl.removeSpace(moduleKey+audioKey);
                console.log(id)
                $(id).collapse('toggle');
                localCtrl.localisedAudio[moduleKey][audioKey]['lang'][language] = response.data[moduleKey][audioKey]['lang'][language];
            }, function(error){
                console.log(error);
                $( "<div class='alert alert-danger alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button><strong>Error : </strong>"+error.data.error+"</div>" ).appendTo( event.target );
            })
        }
        function uploadText(moduleKey, textKey, text, event) {
            console.log(event.target)
            $http({
                method: 'PUT',
                url: '/add/langtext',
                data : {
                    module : moduleKey,
                    text : textKey,
                    language : text.language,
                    type : text.text
                }
            })
            .then(function(response){
                var id = '#' + localCtrl.removeSpace(moduleKey+textKey);
                console.log(id)
                $(id).collapse('toggle');
                localCtrl.localisedText[moduleKey][textKey]['lang'][text.language] = response.data[moduleKey][textKey]['lang'][text.language];
            }, function(error){
                console.log(error);
                $( "<div class='alert alert-danger alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button><strong>Error : </strong>"+error.data.error+"</div>" ).appendTo( event.target );
            })
        }

        function addSoundModule(soundModule) {
            var data = {}
            data['module'] = soundModule.moduleName;
            data['soundModule'] = {};
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
                console.log('Success : ', response)
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
