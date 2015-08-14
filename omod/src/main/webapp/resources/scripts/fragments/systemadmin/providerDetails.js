var uuidAndProviderMap;
var providerRoles;
var providerTabs;

$(document).ready(function(){
    providerTabs = $('#adminui-providers').tabs();
});

function initProviderDetails(uuidAndProvider, provRoles){
    uuidAndProviderMap = uuidAndProvider;
    providerRoles = provRoles;
}

angular.module('pmProviderService', ['ngResource','uicommons.common'])
    .factory('PmProvider', function($resource) {
        var url = "/"+contextPath +"/adminui/systemadmin/accounts/providerTabContentPane/process.action";
        return $resource(url, {},{
            process:{
                method:"POST"
            }
        });
    }).

    config(function($httpProvider) {
        $httpProvider.defaults.transformRequest = [];
        $httpProvider.defaults.transformRequest.push(transformRequest);
    });

angular.module("adminui.providerDetails", ["ngDialog", "pmProviderService"])

    .controller("ProviderDetailsController", ["$scope", "ngDialog", "PmProvider",
        function($scope, ngDialog, PmProvider) {
            $scope.inEditMode = false;
            $scope.uuidProviderMap = uuidAndProviderMap;
            $scope.originalState = angular.copy($scope.uuidProviderMap);
            $scope.roles = providerRoles;

            $scope.getTabLabel = function(providerUuid, defaultLabel){
                var p = $scope.uuidProviderMap[providerUuid];
                if(p && p.providerRole){
                    return $scope.roles[p.providerRole];
                }
                 return "\""+defaultLabel+"\"";
            }

            $scope.toggleOtherActions = function(value){
                //Disable the edit,remove,add buttons in the other apps
                var personScope = angular.element("#adminui-person-details").scope();
                personScope.$apply(function(){
                    personScope.inEditMode = value;
                });
                var userScope = angular.element("#adminui-user-details").scope();
                userScope.$apply(function(){
                    userScope.inEditMode = value;
                });
            }

            $scope.add = function(uuid){
                $scope.toggleOtherActions(true);
                jq('.add-action, .edit-action, .delete-action').addClass('invisible');
                providerTabs.tabs("disable");
                providerTabs.tabs("enable", "#"+uuid);
            }

            $scope.edit = function(uuid){
                $scope.toggleOtherActions(true);
                jq('.add-action, .edit-action, .delete-action').addClass('invisible');
                jq('.provider-'+uuid).toggle();
                providerTabs.tabs("disable");
                providerTabs.tabs("enable", "#"+uuid);
            }

            $scope.cancel = function(providerUuid, isNew){
                //reset the form values
                $scope.uuidProviderMap[providerUuid] = angular.copy($scope.originalState[providerUuid]);
                $scope.providerDetailsForm.$setPristine();
                $scope.providerDetailsForm.$setUntouched();
                jq('.add-action, .edit-action, .delete-action').removeClass('invisible');
                providerTabs.tabs("enable");
                if(isNew){
                    providerTabs.tabs("option", "active", 0);
                } else{
                    jq('.provider-'+providerUuid).toggle();
                }
                $scope.toggleOtherActions(false);
            }

            $scope.save = function(providerUuid, personUuid){
                var toSave = angular.copy($scope.uuidProviderMap[providerUuid]);
                if(personUuid){
                    toSave['person'] = personUuid;
                }

                PmProvider.process(toSave).$promise.then(function (resp) {
                    emr.successMessage(resp.message);
                    if(personUuid){
                        emr.navigateTo({
                            provider:"adminui",
                            page: "systemadmin/accounts/account",
                            query: {personId: personUuid}
                        });
                    } else{
                        //update cache
                        $scope.originalState[providerUuid] = angular.copy($scope.uuidProviderMap[providerUuid]);
                        jq('.provider-'+providerUuid).toggle();
                        jq('.add-action, .edit-action, .delete-action').removeClass('invisible');
                        providerTabs.tabs("enable");
                        $scope.toggleOtherActions(false);
                        //notify the audit info app so that it updates the audit info
                        angular.element('#account-audit-info').scope().$broadcast('event.auditInfo.changed');
                    }
                },
                 function (resp) {
                     var errorMessage = "";
                     if(resp.data.globalErrors){
                        errorMessage+=(resp.data.globalErrors.join("</br>"));
                     }
                     if(resp.data.fieldErrors){
                         jq.each(resp.data.fieldErrors, function(key, value) {
                             errorMessage+=("</br>"+value.join("</br>"));
                         });
                     }
                     emr.errorMessage(errorMessage);
                });
            }

            $scope.retire = function(providerUuid) {
                var provider = $scope.uuidProviderMap[providerUuid];
                var roles = $scope.roles;
                ngDialog.openConfirm({
                    showClose: false,
                    closeByEscape: true,
                    closeByDocument: true,
                    template: 'retireProviderTemplate',
                    controller: function($scope) {
                        $scope.display = "";
                        if(provider.identifier) {
                            $scope.display += provider.identifier;
                        }
                        if(provider.providerRole) {
                            $scope.display += (" ("+roles[provider.providerRole]+")");
                        }
                    }
                }).then(function(reason) {
                    PmProvider.process({
                        uuid: providerUuid,
                        reason: reason,
                        action: "retire"
                    }).$promise.then(function(resp) {
                        emr.successMessage(resp.message);
                        //Update the cache with new state
                        provider.retired = true;
                        $scope.originalState[providerUuid] = angular.copy(provider);
                        angular.element('#account-audit-info').scope().$broadcast('event.auditInfo.changed');
                    },
                    function (resp) {
                        emr.errorMessage(resp.data.globalErrors[0]);
                    });
                });
            }

            $scope.restore = function(providerUuid) {
                PmProvider.process({
                    uuid: providerUuid,
                    action: "restore"
                }).$promise.then(function(resp) {
                    emr.successMessage(resp.message);
                    var provider = $scope.uuidProviderMap[providerUuid];
                    provider.retired = false;
                    $scope.originalState[providerUuid] = angular.copy(provider);
                    angular.element('#account-audit-info').scope().$broadcast('event.auditInfo.changed');
                },
                function (resp) {
                    emr.errorMessage(resp.data.globalErrors[0]);
                });
            }
        }
    ]);

function transformRequest(data, getHeaders){
    var headers = getHeaders();
    //Disable angular serializing of data to json and
    //instead send it as form url encoded data
    headers[ "Content-Type" ] = "application/x-www-form-urlencoded; charset=utf-8";
    return serialize(data);
}

function serialize(data){
    var serializedData= "";
    //This method assumes all the keys are not objects themselves
    jq.each(data, function(key, value) {
        serializedData+=(encodeURIComponent(key) + '=' + encodeURIComponent(value)+"&");
    });
    return serializedData;
}