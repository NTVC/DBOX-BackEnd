var deviceModal = "#deviceModal";
var deviceVersionModal = "#deviceVersionModal";
var deviceVersionsModal = "#deviceVersionsModal";

var deviceThumb = "#deviceThumb";

dbox.controller('deviceListController', function ($scope, deviceService) {
    $scope.devices = null;
    $scope.limits = getShowLimit();
    
    $scope.filter = {
        search: (getQueryParams().e ? getQueryParams().e : ""),
        status: (getQueryParams().e ? "" : "1"),
        pg: {
            index: 0, 
            limit: '25',
            range: 0,
            total: 0
        }
    }
    
    // RESET SEARCH FILTER
    $scope.rSearch = function () {
        
        $scope.filter.search = "";
        $scope.filter.pg.index = 0;
        $scope.search();
    };
    
    // SEARCH DEVICES
    $scope.search = function () {
        
        // GET ALL DATA ON THE BASE
        deviceService.handler(getFilter(false)).then(function (data) {
            if (checkMessage(data)) {
                $scope.devices = data;
            }
        });
        
        // GET NUMBER OF DATA ON THE BASE
        deviceService.handler(getFilter(true)).then(function (data) {
            
            $scope.filter.pg.total = data;
            $scope.filter.pg = preparePagination($scope.filter.pg);
        });
    };
    
    var getFilter = function (isCounter) {
        
        var filter = {};
        
        
        filter.list = true;
        filter.search = $scope.filter.search;
        filter.status = $scope.filter.status;
        
        if (isCounter) {
            filter.count = true;
        }
        else {
            filter.pg_index = $scope.filter.pg.index;
            filter.pg_limit = $scope.filter.pg.limit;
        }
        
        return filter;

    }
    
    // NEW DEVICE
    $scope.new = function () {
        getScope(deviceModal).edit({});
    };
    
    // DEVICE VERSIONs
    $scope.deviceVersions = function () {
        getScope(deviceVersionsModal).listAll();
    };

    // EDIT DEVICE
    $scope.edit = function (data) {
        setDeviceModal(data, false);
    };
    
    // DELETE DEVICE
    $scope.delete = function (data) {
        
        var modal = {};
        
        modal.title = 'Delete device';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove the device <b>' + data.title + '</b>?';
        modal.invoke = 'deleteDevice';
        modal.obj = data;
        
        setMainModal(modal);
    };
    
    $scope.search();
});

dbox.controller('genericModal', function ($scope, deviceService, deviceVersionService) {
    
    /*##############################################################*/
    //MODALS
    $scope.modal = {};
    
    $scope.modalAction = function (ac) {
        
        var keywords = null;
        $scope.modal.loader = 1;
        
        // DELETE DEVICE
        if (ac == 'deleteDevice') {
            
            keywords = { id: $scope.modal.obj._id, "delete": true };
            
            deviceService.handler(keywords).then(function (response) {
                if (checkMessage(response)) {
                    
                    modelAlertClose();
                    getScope("container").rSearch();
                    $scope.modal = null;
                }
            });
        }
        else if (ac == 'deleteDeviceVersion') {
            
            keywords = { id: $scope.modal.obj._id, "delete": true };
            
            deviceVersionService.handler(keywords).then(function (response) {
                if (checkMessage(response)) {
                    
                    modelAlertClose();
                    
                    var s = getScope(deviceVersionsModal);
                    
                    var index = s.deviceVersions.indexOf($scope.modal.obj);
                    s.deviceVersions.splice(index, 1);
                    $scope.modal = null;
                }
            });
        }
    };

});

dbox.controller('deviceModalController', function ($scope, deviceService, deviceVersionService) {
    $scope.device = null;
    $scope.deviceVersions;
    
    /*##############################################################*/
    // EDIT / ADD DEVICE
    $scope.edit = function (data) {
        $scope.device = data;
        $(deviceModal).modal('show');
    };
    
    var getVersions = function () {
        // GET ALL DATA ON THE BASE
        deviceVersionService.handler({list:true}).then(function (data) {
            if (checkMessage(data)) {
                $scope.deviceVersions = data;
            }
        });
    };
    
    //CHECK MAC
    $scope.checkMac = function () {
        
        if (isNullorEmpty($scope.device.ethMac)) {
            return false;
        }
        
        $scope.device.mac_load = 1;
        // GET NUMBER OF DATA ON THE BASE
        deviceService.handler({ ethMac: $scope.device.ethMac, check: true }).
        then(function (data) {
            
            if (JSON.stringify(data) != '[]' && data[0]._id != $scope.device._id) {
                $scope.device.check_mac = $scope.device.wMac + ' already registered';
                $scope.device.wMac = '';
            }
            else {
                $scope.device.check_mac = 'Available';
            }
            
            $scope.device.mac_load = null;
        });
    };
    
    $scope.save = function () {
        
        if (validation()) {
            
            $scope.device.loader = true;
            $scope.device.save = true;
            
            deviceService.handler($scope.device).then(function (data) {
                
                if (checkMessage(data)) {
                    $scope.device.loader = null;
                    listDevice();
                }
            
            });
            
        }
    };
    
    var listDevice = function () {

        $(deviceModal).modal('hide');
        getScope("container").rSearch();

    }
    
    var validation = function () {
        
        var error = '';
        delete $scope.device.error;
        
        if (isNullorEmpty($scope.device.ethMac) || (!isValidMacAddress($scope.device.ethMac)))
            error += errorTemplate('Mac Address');
        if (isNullorEmpty($scope.device.wMac) || (!isValidMacAddress($scope.device.wMac)))
            error += errorTemplate('wMac Address');
        if (isNullorEmpty($scope.device.model_number))
            error += errorTemplate('Model Number');
        if (isNullorEmpty($scope.device.uid))
            error += errorTemplate('Uid');
        if (isNullorEmpty($scope.device.version_code))
            error += errorTemplate('Version');
        if (isNullorEmpty($scope.device.status))
            error += errorTemplate('Status');
            
            
        // NO CHANGES
        if (isNullorEmpty(error) && angular.equals($scope.device, $scope.old_scope))
            error += errorTemplate('No changes to save');
        
        if ($.trim(error) != "") {
            scrollTop();
            $scope.device.error = error;
            return false;
        }
        else{
            $scope.device.error = null;
            return true;
        }
    };
    
    getVersions();
});

dbox.controller('deviceVersionsModalController', function ($scope, deviceVersionService) {
    
    $scope.deviceVersions = null;
    
    /*##############################################################*/
    // DELETE DEVICE
    $scope.delete = function (data) {
        
        var modal = {};
        
        modal.title = 'Delete device version';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove the device version <b>' + data.title + '</b>?';
        modal.invoke = 'deleteDeviceVersion';
        modal.obj = data;
        
        setMainModal(modal);
    };
    
    /*##############################################################*/
    // EDIT DATA
    $scope.edit = function (data){
        getScope(deviceVersionModal).edit(data);
    }
    
    /*##############################################################*/
    // GET ALL DEVICE VERIONS
    $scope.listAll = function () {

        $scope.getDeviceVersions();
        $(deviceVersionsModal).modal('show');
    };
    
    var getFilter = function (isCounter) {
        
        var filter = {};
        
        
        filter.list = true;
        
        if (isCounter) {
            filter.count = true;
        }
        else {
            filter.pg_index = 0;
            filter.pg_limit = 50;
        }
        
        return filter;

    }
    
    // SEARCH ADMINS
    $scope.getDeviceVersions = function () {
        
        // GET ALL DATA ON THE BASE
        deviceVersionService.handler(getFilter(false)).then(function (data) {
            if (checkMessage(data)) {
                $scope.deviceVersions = data;
            }
        });
        
    };
    
});

dbox.controller('deviceVersionModalController', function ($scope, deviceVersionService) {
    
    $scope.deviceVersion = {};
    $scope.old_scope = null;
    
    $scope.edit = function (data) {
        
        $scope.deviceVersion = data;

        $(deviceVersionsModal).modal('hide');
        $(deviceVersionModal).modal('show');
    };
    
    $scope.save = function () {
        
        // IF ARE THE SAME, AVOID CALL
        if (JSON.stringify($scope.deviceVersion) == JSON.stringify($scope.old_scope))
            return false;
        else
            $scope.old_scope = angular.copy($scope.deviceVersion);
        
        if (validation()) {
            
            $scope.deviceVersion.thumb_file = $scope.getThumb();
            $scope.deviceVersion.loader = true;
            $scope.deviceVersion.save = true;
            
            deviceVersionService.form($scope.deviceVersion, doneDeviceVersion);

        }
    };
    
    /*##############################################################*/
    // EDIT LOGO
    
    $scope.editThumb = function () {
        
        $(deviceThumb).unbind();
        $(deviceThumb).trigger("click");
        $(deviceThumb).change(function () {
            readURL(this, deviceThumb);
        });
    }
    
    // SAVE THUMBNAIL
    $scope.getThumb = function() {
        
        var files = $(deviceThumb).get(0).files;
        
        if (files.length > 0) {
            return files[0];
        }
        else {
            return '';
        }
       
    }
    
    // VALIDATE BASIC FIELD
    var validation = function () {
        
        var error = '';
        $scope.deviceVersion.error = null;
        
        if (isNullorEmpty($scope.deviceVersion.title))
            error += errorTemplate('Title');

        if ($.trim(error) != "") {
            scrollTop();
            $scope.deviceVersion.error = error;
            return false;
        }
        else
            return true;
    };

});

function doneDeviceVersion(data){
    
    $(deviceVersionModal).modal('hide');
    getScope(deviceVersionModal).deviceVersion.loader = null;
    getScope(deviceVersionsModal).listAll();
}

// OPEN UP MODAL EDITING
function setDeviceModal(data, isSearch) {
    
    var s = getScope("deviceModal");
    
    var c = angular.copy(data);
    c.active = String(c.active);
    
    s.device = c;
    
    if (!isSearch) {
        s.old_scope = angular.copy(c);
    }
    
    $(deviceModal).modal('show');
};

dbox.factory('deviceService', function ($http) {
    var path = '/handler/device';

    return {
        handler: function (keywords) {
            //return the promise directly.
            return $http({
                url: path,
                method: "post",
                params: keywords
            })
            .then(function (result) {
                //resolve the promise as the data
                return result.data;
            });
        }
    }
});

dbox.factory('deviceVersionService', function ($http) {
    var path = '/handler/deviceVersion';
    
    return {
        handler: function (keywords) {
            //return the promise directly.
            return $http({
                url: path,
                method: "post",
                params: keywords
            })
            .then(function (result) {
                //resolve the promise as the data
                return result.data;
            });
        },
        form: function (keywords, callback) {
            
            var formData = new FormData();
            
            for (var key in keywords) {
                
                if ($.isArray(keywords[key])) {
                    
                    formData.append(key, angular.toJson(keywords[key]));
                }
                else {
                    formData.append(key, keywords[key]);
                }
            }
            
            return $.ajax({
                type: 'post',
                url: (path),
                data: formData,
                contentType: false,
                cache: false,      
                processData: false,
                async: false
            }).done(function (response) {
                
                if (checkMessage(response)) {
                    
                    try {
                        callback(JSON.parse(response));
                    }
                            catch (e) {
                        callback(null);
                    }
                            
                }
                else {
                    showFailNotification();
                }
            });

        }
    }
});
