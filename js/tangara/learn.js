require.config({
    "baseUrl": 'js/tangara',
    paths: {
        "jquery": '../libs/jquery-1.11.1/jquery-1.11.1.min',
        "jquery_animate_enhanced": '../libs/jquery.animate-enhanced/jquery.animate-enhanced.min',
        "ace": '../libs/ace-1.1.7',
        "babylon": '../libs/babylonjs/babylon.1.14',
        "babylonjs": '../libs/babylon-editor/babylon-editor',
        "split-pane": '../libs/split-pane/split-pane',
        "quintus": '../libs/quintus-0.2.0/quintus-all.min',
        "acorn": '../libs/acorn/acorn',
        "TObject": 'objects/tobject/TObject',
        "TObject3D": 'objects/tobject3d/TObject3D',
        "TGraphicalObject": 'objects/tgraphicalobject/TGraphicalObject',
        "jquery-ui": '../libs/jquery.ui-1.11.2',
        "TProject": "data/TProject",
        "TProgram": "data/TProgram",
        "TEnvironment": "env/TEnvironment",
        "TLink": "env/TLink",
        "TI18n": "env/TI18n",
        "TInterpreter": "run/TInterpreter",
        "TParser": "run/TParser",
        "TRuntime": "run/TRuntime",
        "TGraphics": "run/TGraphics",
        "TUI": "ui/TUI",
        "CommandManager": "utils/CommandManager",
        "ResourceManager": "utils/ResourceManager",
        "SynchronousManager": "utils/SynchronousManager",
        "TError": "utils/TError",
        "TUtils": "utils/TUtils",
        "platform-pr": "http://algorea-beta.eroux.fr/platform-pr",
        "json": "../libs/pem-task/json2.min",
        "Task": "env/Task",
        "Grader": "env/Grader",
        "TExercise": "data/TExercise",
        "TResource": "data/TResource",
        "jschannel": "../libs/jschannel/jschannel"
    },
    map: {
        "fileupload": {
            "jquery.ui.widget": 'jquery-ui/widget'
        }
    },
    shim: {
        'platform-pr': {
            deps: ['jquery', 'jschannel'],
            exports: '$'
        },
        'split-pane': {
            deps: ['jquery']
        }
    }    
});

//window.location.protocol + "//" + window.location.host+ window.location.pathname.split("/").slice(0, -1).join("/")+"/js/tangara",
//baseUrl: 'js/tangara',
// Start the main app logic.

function load() {
    require(['jquery', 'TEnvironment', 'TRuntime', 'ui/TLearnFrame', 'Task', 'Grader'], function($, TEnvironment, TRuntime, TLearnFrame, Task, Grader) {
        window.console.log("*******************");
        window.console.log("* Loading Environment *");
        window.console.log("*******************");
        TEnvironment.load(function() {
            TEnvironment.log("*******************");
            TEnvironment.log("* Loading Runtime *");
            TEnvironment.log("*******************");
            TRuntime.load(function() {
                TEnvironment.log("***************************");
                TEnvironment.log("* Building User Interface *");
                TEnvironment.log("***************************");
                frame = new TLearnFrame(function(component) {
                    $("body").append(component);
                    TEnvironment.log("*******************");
                    TEnvironment.log("* Initiating link *");
                    TEnvironment.log("*******************");
                    // Create task and grader
                    window.task = new Task(this);
                    window.grader = new Grader();
                    //window.platform.initWithTask(window.task);
                    // get exercise id
                    var exerciseId;
                    if (typeof init_exerciseId !== 'undefined') {
                        // get id from server
                        exerciseId = init_exerciseId;
                    } else {
                        // get id from hash
                        var hash = document.location.hash;
                        exerciseId = parseInt(hash.substring(1));
                    }
                    TEnvironment.log("********************");
                    TEnvironment.log("* Loading exercise *");
                    TEnvironment.log("********************");
                    var self = this;
                    $(document).ready(function() {
                        // Create task and grader
                        self.displayed();
                        // trigger resize in order for canvas to update its size (and remove the 5px bottom margin)
                        $(window).resize();
                        if (isNaN(exerciseId)) {
                            window.console.error("Could not find exercise id");
                            self.init();
                        } else {
                            self.loadExercise(exerciseId, function() {
                                self.init();
                            });
                        }
                    });
                });
            });
        });
    });
}

var loading = new Image();
loading.src = "images/loader2.gif";
if (loading.complete) {
    load();
} else {
    loading.onload = load();
}


