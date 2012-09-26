﻿(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/mediacap/mediacap.html", {
        ready: function (element, options) {
            q(".still button").onclick = function () {
                new Windows.Media.Capture.CameraCaptureUI().captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photo)
                    .done(function (file) {
                        if (file) q("#capturedImage").src = URL.createObjectURL(file);
                    });
            };
            q(".video button").onclick = function () {
                var dialog = new Windows.Media.Capture.CameraCaptureUI();
                dialog.videoSettings.format = Windows.Media.Capture.CameraCaptureUIVideoFormat.mp4;
                dialog.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.video)
                    .done(
                        function (file) {
                            if (file) {
                                var videoBlobUrl = URL.createObjectURL(file, { oneTimeOnly: true });
                                q("#capturedVideo").src = videoBlobUrl;
                            }
                        },
                        function (err) {
                            debugger;
                        }
                    );
            };

            //TODO: consider https://github.com/katspaugh/wavesurfer.js for visualizing waveform?
            var recording = false;
            var capture;
            var fileName;
            q(".audio button").onclick = function () {
                if (!recording) {
                    Windows.Devices.Enumeration.DeviceInformation.findAllAsync(Windows.Devices.Enumeration.DeviceClass.audioCapture).then(function(devices) {
                        var captureInitSettings;
                        captureInitSettings = new Windows.Media.Capture.MediaCaptureInitializationSettings();
                        captureInitSettings.audioDeviceId = "";
                        captureInitSettings.streamingCaptureMode = Windows.Media.Capture.StreamingCaptureMode.audio;
                        captureInitSettings.realTimeModeEnabled = true;

                        var MY_HEADPHONES_ID = 1;
                        captureInitSettings.audioDeviceId = devices[MY_HEADPHONES_ID].id;


                        capture = new Windows.Media.Capture.MediaCapture();
                        var profile;
                        capture.initializeAsync(captureInitSettings).then(function(result) {
                            profile = Windows.Media.MediaProperties.MediaEncodingProfile.createWma(Windows.Media.MediaProperties.AudioEncodingQuality.high);
                            Windows.Storage.KnownFolders.musicLibrary.createFileAsync("capture.wma", Windows.Storage.CreationCollisionOption.generateUniqueName).then(function (newFile) {
                                capture.startRecordToStorageFileAsync(profile, newFile).then(function (result) {
                                    recording = true;
                                    fileName = newFile.name;
                                    q(".audio button").innerText = "Stop capturing audio";
                                    q(".audio button").classList.add("recording");
                                });
                            });
                        });

                    });
                }
                else {
                    capture.stopRecordAsync();
                    recording = false;
                    q(".audio button").innerText = "Start capturing audio";
                    q(".audio button").classList.remove("recording");
                    Windows.Storage.KnownFolders.musicLibrary.getFileAsync(fileName).then(function (captureFile) {
                        var audioBlobUrl = URL.createObjectURL(captureFile, { oneTimeOnly: true });
                        q("#capturedAudio").src = audioBlobUrl;
                    });
                }
            };
        }
    });
})();
