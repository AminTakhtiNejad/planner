/*global gantt*/
/* eslint-disable */
gantt.plugin(function(t) {
  t._get_linked_task = function(e, i) {
    var r = null,
      n = i ? e.target : e.source;
    return t.isTaskExists(n) && (r = t.getTask(n)), r;
  };
  t._get_link_target = function(e) {
    return t._get_linked_task(e, !0);
  };
  t._get_link_source = function(e) {
    return t._get_linked_task(e, !1);
  };
  var e = !1,
    i = {},
    r = {},
    n = {},
    a = {};
  t._isLinksCacheEnabled = function() {
    return e;
  };
  t._startLinksCache = function() {
    (i = {}), (r = {}), (n = {}), (a = {}), (e = !0);
  };
  t._endLinksCache = function() {
    (i = {}), (r = {}), (n = {}), (a = {}), (e = !1);
  };
  t._formatLink = function(r) {
    if (e && i[r.id]) return i[r.id];
    var n = [],
      a = this._get_link_target(r),
      s = this._get_link_source(r);
    if (!s || !a) return n;
    if (
      (t.isSummaryTask(a) && t.isChildOf(s.id, a.id)) ||
      (t.isSummaryTask(s) && t.isChildOf(a.id, s.id))
    )
      return n;
    for (
      var c = this._getImplicitLinks(
          r,
          s,
          function(t) {
            return 0;
          },
          !0
        ),
        u = t.config.auto_scheduling_move_projects,
        o = this.isSummaryTask(a)
          ? this.getSubtaskDates(a.id)
          : { start_date: a.start_date, end_date: a.end_date },
        d = this._getImplicitLinks(r, a, function(e) {
          return u
            ? e.$target.length || t.getState().drag_id == e.id
              ? 0
              : t.calculateDuration({
                  start_date: o.start_date,
                  end_date: e.start_date,
                  task: s
                })
            : 0;
        }),
        h = 0,
        l = c.length;
      h < l;
      h++
    )
      for (var _ = c[h], g = 0, f = d.length; g < f; g++) {
        var k = d[g],
          p = 1 * _.lag + 1 * k.lag,
          v = {
            id: r.id,
            type: r.type,
            source: _.task,
            target: k.task,
            lag: (1 * r.lag || 0) + p
          };
        n.push(
          t._convertToFinishToStartLink(
            k.task,
            v,
            s,
            a,
            _.taskParent,
            k.taskParent
          )
        );
      }
    return e && (i[r.id] = n), n;
  };
  t._isAutoSchedulable = function(t) {
    return !1 !== t.auto_scheduling;
  };
  t._getImplicitLinks = function(e, i, r, n) {
    var a = [];
    if (this.isSummaryTask(i)) {
      var s,
        c = {};
      for (var u in (this.eachTask(function(t) {
        this.isSummaryTask(t) || (c[t.id] = t);
      }, i.id),
      c)) {
        var o = c[u],
          d = n ? o.$source : o.$target;
        s = !1;
        for (var h = 0; h < d.length; h++) {
          var l = t.getLink(d[h]),
            _ = n ? l.target : l.source,
            g = c[_];
          if (
            g &&
            !1 !== o.auto_scheduling &&
            !1 !== g.auto_scheduling &&
            ((l.target == g.id && Math.abs(l.lag) <= g.duration) ||
              (l.target == o.id && Math.abs(l.lag) <= o.duration))
          ) {
            s = !0;
            break;
          }
        }
        s || a.push({ task: o.id, taskParent: o.parent, lag: r(o) });
      }
    } else a.push({ task: i.id, taskParent: i.parent, lag: 0 });
    return a;
  };
  t._getDirectDependencies = function(t, e) {
    for (
      var i = [], r = [], n = e ? t.$source : t.$target, a = 0;
      a < n.length;
      a++
    ) {
      var s = this.getLink(n[a]);
      if (this.isTaskExists(s.source) && this.isTaskExists(s.target)) {
        var c = this.getTask(s.target);
        this._isAutoSchedulable(c) && i.push(this.getLink(n[a]));
      }
    }
    for (a = 0; a < i.length; a++) r = r.concat(this._formatLink(i[a]));
    return r;
  };
  t._getInheritedDependencies = function(t, i) {
    var a,
      s = !1,
      c = [];
    if (this.isTaskExists(t.id)) {
      this.getParent(t.id);
      this.eachParent(
        function(t) {
          var u;
          s ||
            (e && (a = i ? r : n)[t.id]
              ? c.push.apply(c, a[t.id])
              : this.isSummaryTask(t) &&
                (this._isAutoSchedulable(t)
                  ? ((u = this._getDirectDependencies(t, i)),
                    e && (a[t.id] = u),
                    c.push.apply(c, u))
                  : (s = !0)));
        },
        t.id,
        this
      );
    }
    return c;
  };
  t._getDirectSuccessors = function(t) {
    return this._getDirectDependencies(t, !0);
  };
  t._getInheritedSuccessors = function(t) {
    return this._getInheritedDependencies(t, !0);
  };
  t._getDirectPredecessors = function(t) {
    return this._getDirectDependencies(t, !1);
  };
  t._getInheritedPredecessors = function(t) {
    return this._getInheritedDependencies(t, !1);
  };
  t._getSuccessors = function(t, e) {
    var i = this._getDirectSuccessors(t);
    return e ? i : i.concat(this._getInheritedSuccessors(t));
  };
  t._getPredecessors = function(t, i) {
    var r,
      n = t.id + i;
    if (e && a[n]) return a[n];
    var s = this._getDirectPredecessors(t);
    return (
      (r = i ? s : s.concat(this._getInheritedPredecessors(t))),
      e && (a[n] = r),
      r
    );
  };
  t._convertToFinishToStartLink = function(e, i, r, n, a, s) {
    var c = {
        target: e,
        link: t.config.links.finish_to_start,
        id: i.id,
        lag: i.lag || 0,
        source: i.source,
        preferredStart: null,
        sourceParent: a,
        targetParent: s
      },
      u = 0;
    switch (i.type) {
      case t.config.links.start_to_start:
        u = -r.duration;
        break;
      case t.config.links.finish_to_finish:
        u = -n.duration;
        break;
      case t.config.links.start_to_finish:
        u = -r.duration - n.duration;
        break;
      default:
        u = 0;
    }
    return (c.lag += u), c;
  };
  t.config.highlight_critical_path = !1;
  t._criticalPathHandler = function() {
    t.config.highlight_critical_path && t.render();
  };
  t.attachEvent("onAfterLinkAdd", t._criticalPathHandler),
    t.attachEvent("onAfterLinkUpdate", t._criticalPathHandler),
    t.attachEvent("onAfterLinkDelete", t._criticalPathHandler),
    t.attachEvent("onAfterTaskAdd", t._criticalPathHandler),
    t.attachEvent("onAfterTaskUpdate", t._criticalPathHandler),
    t.attachEvent("onAfterTaskDelete", t._criticalPathHandler),
    (t._isCriticalTask = function(e, i) {
      if (e && e.id) {
        var r = i || {};
        if (this._isProjectEnd(e)) return !0;
        var n = !1;
        t._isLinksCacheEnabled() || (t._startLinksCache(), (n = !0)),
          (r[e.id] = !0);
        for (var a = this._getDependencies(e), s = 0; s < a.length; s++) {
          var c = this.getTask(a[s].target);
          if (
            this._getSlack(e, c, a[s]) <= 0 &&
            !r[c.id] &&
            this._isCriticalTask(c, r)
          )
            return !0;
        }
        return n && t._endLinksCache(), !1;
      }
    });
  t.isCriticalTask = function(e) {
    return (
      t.assert(
        !(!e || void 0 === e.id),
        "Invalid argument for gantt.isCriticalTask"
      ),
      this._isCriticalTask(e, {})
    );
  };
  t.isCriticalLink = function(e) {
    return this.isCriticalTask(t.getTask(e.source));
  };
  t.getSlack = function(t, e) {
    for (var i = [], r = {}, n = 0; n < t.$source.length; n++)
      r[t.$source[n]] = !0;
    for (n = 0; n < e.$target.length; n++)
      r[e.$target[n]] && i.push(e.$target[n]);
    var a = [];
    for (n = 0; n < i.length; n++) {
      var s = this.getLink(i[n]);
      a.push(
        this._getSlack(
          t,
          e,
          this._convertToFinishToStartLink(s.id, s, t, e, t.parent, e.parent)
        )
      );
    }
    return Math.min.apply(Math, a);
  };
  t._getSlack = function(t, e, i) {
    var r = this.config.types,
      n = null;
    n = this.getTaskType(t.type) == r.milestone ? t.start_date : t.end_date;
    var a = e.start_date,
      s = 0;
    s =
      +n > +a
        ? -this.calculateDuration({ start_date: a, end_date: n, task: t })
        : this.calculateDuration({ start_date: n, end_date: a, task: t });
    var c = i.lag;
    return c && 1 * c == c && (s -= c), s;
  };
  t._getProjectEnd = function() {
    var e = t.getTaskByTime();
    return (e = e.sort(function(t, e) {
      return +t.end_date > +e.end_date ? 1 : -1;
    })).length
      ? e[e.length - 1].end_date
      : null;
  };
  t._isProjectEnd = function(t) {
    return !this._hasDuration({
      start_date: t.end_date,
      end_date: this._getProjectEnd(),
      task: t
    });
  };
  t._getSummaryPredecessors = function(e) {
    var i = [];
    return (
      this.eachParent(function(e) {
        this.isSummaryTask(e) && (i = i.concat(t._getDependencies(e)));
      }, e),
      i
    );
  };
  t._getDependencies = function(t) {
    return this._getSuccessors(t).concat(this._getSummaryPredecessors(t));
  };
});
