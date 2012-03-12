describe("app.views.Stream", function() {
  beforeEach(function() {
    loginAs({name: "alice", avatar : {small : "http://avatar.com/photo.jpg"}});

    this.posts = $.parseJSON(spec.readFixture("stream_json"))["posts"];

    this.stream = new app.models.Stream();
    this.stream.add(this.posts);

    this.view = new app.views.Stream({model : this.stream});

    app.stream.bind("fetched", this.collectionFetched, this); //untested

    // do this manually because we've moved loadMore into render??
    this.view.render();
    _.each(this.view.collection.models, function(post) {
      this.view.addPost(post);
    }, this);
  });

  describe("initialize", function() {
    it("binds an infinite scroll listener", function() {
      spyOn($.fn, "scroll");
      new app.views.Stream({model : this.stream});
      expect($.fn.scroll).toHaveBeenCalled();
    });
  });

  describe("#render", function() {
    beforeEach(function() {
      this.statusMessage = this.stream.posts.models[0];
      this.statusElement = $(this.view.$(".stream_element")[0]);
    });

    context("when rendering a status message", function() {
      it("shows the message in the content area", function() {
        expect(this.statusElement.find(".post-content p").text()).toContain("LONG POST"); //markdown'ed
      });
    });
  });

  describe('clicking read more', function() {
    var readMoreLink;

    beforeEach(function() {
      this.statusMessage = this.stream.posts.models[0];
      this.statusElement = $(this.view.$(".stream_element")[0]);
      readMoreLink = this.statusElement.find('.expander');
      readMoreLink.text("read more");

      $(this.view.el).find('.collapsible').css('width', 400); // make content narrow like in real stream
      setFixtures(this.view.el);
      this.view.postRender();
    });

    it('expands the post', function() {
      // TODO
      var textElement = this.statusElement.find('.collapsible');
      expect(textElement.hasClass('collapsed')).toBeTruthy();
      readMoreLink.click();
      expect(textElement.hasClass('collapsed')).toBeFalsy();
      expect(textElement.hasClass('opened')).toBeTruthy();
    });
  });

  describe("infScroll", function() {
    // NOTE: inf scroll happens at 500px

    it("calls render when the user is at the bottom of the page", function() {
      spyOn($.fn, "height").andReturn(0);
      spyOn($.fn, "scrollTop").andReturn(100);
      spyOn(this.view, "render");

      this.view.infScroll();
      expect(this.view.render).toHaveBeenCalled();
    });
  });

  describe("removeLoader", function() {
    it("emptys the pagination div when the stream is fetched", function() {
      $("#jasmine_content").append($('<div id="paginate">OMG</div>'));
      expect($("#paginate").text()).toBe("OMG");
      this.view.stream.trigger("fetched");
      expect($("#paginate")).toBeEmpty();
    });
  });

  describe("unbindInfScroll", function() {
    it("unbinds scroll", function() {
      spyOn($.fn, "unbind");
      this.view.unbindInfScroll();
      expect($.fn.unbind).toHaveBeenCalledWith("scroll");
    });
  });
});
