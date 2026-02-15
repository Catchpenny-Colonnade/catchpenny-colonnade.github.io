namespace("sprocket.UpdateQueue", {}, () => {
  const UpdateQueue = function(getState, setState, pollInterval) {
    const queue = [];
    this.enqueue = function(updateFunction) {
      queue.push(updateFunction);
    };
    const interval = setInterval(() => {
      const updateFunctions = queue.splice(0, queue.length);
      setState(updateFunctions.reduce((updates, updateFunction) => {
        return updateFunction(updates);
      }, getState()))
    }, pollInterval);
  }
  return UpdateQueue;
});