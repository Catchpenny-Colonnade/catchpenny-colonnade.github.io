namespace("jeopardized.DisplayWindow", {}, () => {
  const DisplayWindow = function(displayName, filename, TemplateClass, addlAttrs) {
    const updateEvent = `window.${displayName}.update`;
    const state = {};
    this.open = function(initState) {
      state.sidecar = window.open(filename, "_blank");
      state.sidecar.document.body.onload = () => {
        const root = state.sidecar.document.getElementById(displayName);
        ReactDOM.createRoot(root).render(<TemplateClass 
          initState={initState}
          addlAttrs={addlAttrs}
          setOnUpdate={(setter) => 
            document.addEventListener(updateEvent, (e) => {
              setter(e.detail, state.sidecar);
            })}></TemplateClass>)
      }
    }
    this.update = function(args) {
      document.dispatchEvent(new CustomEvent(updateEvent, { detail: args }));
    }
    this.close = function() {
      state.sidecar.close();
    }
  };
  return DisplayWindow;
});