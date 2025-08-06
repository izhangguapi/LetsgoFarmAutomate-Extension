export default defineBackground(() => {
  console.log("Background script running", { id: browser.runtime.id });
});
