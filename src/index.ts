import Main from "./Main";

(function(){

    function onLoadHandler(){

        window.removeEventListener("load", onLoadHandler);

        Main.init(document.body);

        window.addEventListener("resize", Main.resize);
    }

    window.addEventListener("load", onLoadHandler);


})();