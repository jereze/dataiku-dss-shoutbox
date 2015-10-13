var shoutBox = (function () {

        var personName = "Unknown";
        var personId = "unknown";

        var settings = {};

        function randomPersonName() {
            var a = ["Small", "Blue", "Fatty", "Pink"];
            var b = ["Bear", "Potato", "Banana", "Kiwi"];

            var rA = Math.floor(Math.random()*a.length);
            var rB = Math.floor(Math.random()*b.length);

            return a[rA] + b[rB];
        }

        function init() {
            //First verify that the user is connected to DSS or delay init()
            if ($rootScope.appConfig === undefined || $rootScope.appConfig.loggedIn === false) {
                setTimeout(function () {
                    init();
                }, 5000);
                return false;
            }
            console.log('shoutBox module loaded');

            //Onload
            $(function() {
                initSettings();

                $(".shoutbox").show();

                //toggle hide/show shoutbox
                $(".shoutbox__header").on("click",function (e) {
                    toggleDisplay();
                });

                //trigger when user hits enter key
                $("#shoutbox__new_message").keypress(function(evt) {
                    if(evt.which == 13) {
                            var message = $(this).val();
                            sendMessage(message);
                            $(this).val('');
                        }
                });

                //register name and id
                personName = $rootScope.appConfig.user.displayName || $rootScope.appConfig.login || randomPersonName();
                personId = $rootScope.appConfig.login || 'unknown';
            });
        }

        // Toggle hide/show shoutbox
        function toggleDisplay() {
            var state = toggleState();

            //toggle show/hide shoutbox__body
            $('.shoutbox__body').slideToggle(200, function() {
                //use toggleState var for icons and unread messages
                if(state == 'open') {
                    //closing the shoutbox
                    setSettings({'shoutbox_is_open': false});
                    $(".shoutbox__header i").attr('class', 'icon-circle-arrow-up');
                } else {
                    //opening the shoutbox
                    setSettings({'shoutbox_is_open': true, 'unread_message': false});
                    $(".shoutbox__header i").attr('class', 'icon-circle-arrow-down');
                }
            });
        }

        // Get toggle state
        function toggleState() {
            return ($('.shoutbox__body').css('display') === 'block') ? 'open' : 'closed';
        }

        // Getting the settings (saved and shared with other windows/tabs via localStorage)
        function initSettings() {
            var default_settings = {
                'volume_is_on': true,
                'shoutbox_is_open': true,
                'unread_message': false
            };
            if (typeof localStorage === "undefined" || localStorage.getItem("shoutbox.settings") === null) {
                //no existing settings
                setSettings(default_settings);
            }
            else {
                //loading existing settings
                console.log('loading existing settings');
                var ls_settings = JSON.parse(localStorage.getItem("shoutbox.settings"));
                console.log(ls_settings);
                var new_settings = $.extend({}, default_settings, ls_settings);
                setSettings(new_settings);
            }
        }

        // Updating or saving settings
        function setSettings(object) {
            console.log('Settings saved');
            console.log(object);
            if (typeof object === 'object' && object !== null) {
                for(var index in object) {
                    settings[index] = object[index];
                }
                if(typeof localStorage !== "undefined") {
                    var ls_settings = JSON.parse(localStorage.getItem("shoutbox.settings"));
                    if (!angular.equals(ls_settings, settings)) {
                        localStorage.setItem('shoutbox.settings', JSON.stringify(settings));
                    }
                }
                applySettings();
            }
        }

        // Apply settings (to the UI, etc.)
        function applySettings() {
            // open or close shoutbox
            if (settings.shoutbox_is_open !== (toggleState() === 'open') ) {
                toggleDisplay();
            }
            // unread notification
            if (settings.unread_message !== $(".shoutbox__header").hasClass("unread")) {
                $(".shoutbox__header").toggleClass("unread");
            }
        }

        // Event fired when settings updated in another window/tab
        window.addEventListener('storage', function(e) {
            if (e.key === 'shoutbox.settings') {
                console.log('Settings updated (from another window)');
                console.log(e.newValue);
                settings = JSON.parse(e.newValue);
                applySettings();
            }
        });
 
        function displayMessage(from_name, from_id, message) {
            var time = new Date().toLocaleTimeString().toString();

            var message_html = '<div class="shoutbox__message">'+
                '<img src="/dip/api/image/get-image?type=USER&id='+from_id+'&size=20x20&hash='+$rootScope.userPicturesHash+'" alt="" />'+
                '<span class="name">'+from_name+'</span>'+
                '<span class="time">'+time+'</span>'+
                message+'</div>';

            $('.shoutbox__messages').append(message_html).children(':last').hide().fadeIn();

            var scrolltoh = $('.shoutbox__messages')[0].scrollHeight;
            $('.shoutbox__messages').scrollTop(scrolltoh);
        }
  
        function sendMessage(message){
            displayMessage(personName, personId, message);
            Notification.broadcastToOtherSessions('shoutbox-receive-message',{from_name:personName, from_id:personId, message:message});
        }

        // Event fired when message received
        Notification.registerEvent('shoutbox-receive-message',function(evt, data) {
            displayMessage(data.from_name, data.from_id, data.message);

            // notification when message is received from another user
            if(data.from_name!==personName) {
                playNotification();
                if (toggleState() == 'closed') {
                    setSettings({'unread_message': true});
                }
            }
        });

        function playNotification() {
            $('#shoutbox__sound').trigger('play');
        }

        // Reveal public pointers to
        // private functions and properties
 
       return {
            init: init,
            toggleDisplay: toggleDisplay
        };
 
    })();
 
shoutBox.init();
