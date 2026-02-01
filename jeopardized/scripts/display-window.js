namespace("jeopardized.DisplayWindow", {}, () => {
  const DisplayWindow = function(displayName, windowTitle, rootClass, TemplateClass, addlAttrs) {
    const updateEvent = `window.${displayName}.update`;
    const state = {};
    this.open = function(initState) {
      state.sidecar = window.open("", "_blank");
      state.sidecar.document.title = windowTitle;
      state.sidecar.document.body.setAttribute("class", rootClass);
      state.sidecar.document.write(`<div id="${displayName}"></div>`);
      const root = state.sidecar.document.getElementById(displayName);
      ReactDOM.createRoot(root).render(<TemplateClass 
        initState={initState}
        addlAttrs={addlAttrs}
        setOnUpdate={(setter) => 
          document.addEventListener(updateEvent, (e) => {
            setter(e.detail);
          })}></TemplateClass>)
    }
    this.update = function(args) {
      document.dispatchEvent(updateEvent, { detail: args });
    }
    this.close = function() {
      state.sidecar.close();
    }
  };
  return DisplayWindow;
});