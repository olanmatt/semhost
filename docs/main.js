$(document).ready(function () {
  var hostname = "localhost";
  var state = {
    organization: "",
    tier: "",
    role: "",
    sequence: "",
    provider: "",
    region: "",
    domain: "",
  }

  /**
   * Resize all text inputs widths to match their value length if populated or placeholder length otherwise.
   */
  function updateInputWidth() {
    $("input[type=text]").each(function () {
      if (this.value.length > 0) {
        $(this).css("width", this.value.length + "ch");
      } else {
        $(this).css("width", this.placeholder.length + "ch");
      }
    });
  }
  updateInputWidth();

  /**
   * Calculate and set a font size such that the form takes up 61.8% of the window width.
   */
  function updateFontSize() {
    // calculate form font size
    var fontSize = parseInt($("form").css("font-size")) * $(window).width() / $("form").width() * 0.618;

    // update font size for all element in flow
    $("form, form input").css("font-size", fontSize);

    // update margin for all elements following flow
    $(".flow-offset").css("margin-left", $("div.label#purpose").css("margin-left"));
  }
  updateFontSize();
  window.onresize = updateFontSize;

  /**
   * Add an error message to the error list.
   * @param {String} msg Error message to add
   */
  function addError(msg) {
    $('#errors').append(`<p>${msg}</p>`);
  }

  /**
   * Write the current hostname to the system clipboard.
   */
  function copyToClipboard() {
    navigator.clipboard.writeText(hostname);
    $("#copyToClipboard").append(" &#x2713;");
  }

  $("input").on("input", function () {
    // reset error list
    $('#errors').empty();

    //
    updateInputWidth();
    updateFontSize();

    // update the state
    state[$(this).attr("name")] = $(this).val();

    // ensure all required fields are populated
    if ([
      state.organization,
      state.tier,
      state.role,
      state.sequence,
      state.provider,
      state.region
    ].filter(e => e === "").length > 0) {
      addError("some required fields are blank")
    }

    // ensure fields match patterns
    $("input[type=text]").each(function () {
      if ($(this).is(":invalid")) {
        addError(`${$(this).attr("name")} does not match pattern ${$(this).attr("pattern")}`);
      }
    });

    // ensure sequence is not 0
    if (parseInt(state.sequence) === 0) {
      addError("sequence values cannot be 0")
    }

    // generate labels
    labels = [
      [
        state.organization,
        state.tier,
        state.role,
        state.sequence
      ].filter((e) => e).join("-"),
      [
        state.provider,
        state.region
      ].filter((e) => e).join("-"),
      state.domain,
    ]

    // ensure labels do not exceed 63 characters
    if (labels.filter(e => e.length > 63).length > 0) {
      addError("label exceeds 63 characters")
    }

    // update the hostname
    hostname = labels.filter((e) => e).join(".");
    if (hostname === "") {
      hostname = "localhost";
    }

    // ensure hostname does not exceed 253 characters
    if (hostname.length > 253) {
      addError("hostname exceeds 253 characters")
    }

    // show clipboard button if no errors
    if ($("#errors").is(':empty')) {
      $("#errors").append('<h1 id="copyToClipboard">Copy To Clipboard</h1>');
      $("#copyToClipboard").on("click", copyToClipboard);
    }
  });

});
