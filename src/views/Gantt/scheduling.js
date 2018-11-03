/*global gantt*/
/* eslint-disable */
gantt.plugin(
  (function(t) {
    (t._get_linked_task = function(e, n) {
      var a = null,
        r = n ? e.target : e.source;
      return t.isTaskExists(r) && (a = t.getTask(r)), a;
    }),
      (t._get_link_target = function(e) {
        return t._get_linked_task(e, !0);
      }),
      (t._get_link_source = function(e) {
        return t._get_linked_task(e, !1);
      });
    var e = !1,
      n = {},
      a = {},
      r = {},
      i = {};
    (t._isLinksCacheEnabled = function() {
      return e;
    }),
      (t._startLinksCache = function() {
        (n = {}), (a = {}), (r = {}), (i = {}), (e = !0);
      }),
      (t._endLinksCache = function() {
        (n = {}), (a = {}), (r = {}), (i = {}), (e = !1);
      }),
      (t._formatLink = function(a) {
        if (e && n[a.id]) return n[a.id];
        var r = [],
          i = this._get_link_target(a),
          s = this._get_link_source(a);
        if (!s || !i) return r;
        if (
          (t.isSummaryTask(i) && t.isChildOf(s.id, i.id)) ||
          (t.isSummaryTask(s) && t.isChildOf(i.id, s.id))
        )
          return r;
        for (
          var o = this._getImplicitLinks(
              a,
              s,
              function(t) {
                return 0;
              },
              !0
            ),
            u = t.config.auto_scheduling_move_projects,
            c = this.isSummaryTask(i)
              ? this.getSubtaskDates(i.id)
              : { start_date: i.start_date, end_date: i.end_date },
            l = this._getImplicitLinks(a, i, function(e) {
              return u
                ? e.$target.length || t.getState().drag_id == e.id
                  ? 0
                  : t.calculateDuration({
                      start_date: c.start_date,
                      end_date: e.start_date,
                      task: s
                    })
                : 0;
            }),
            d = 0,
            g = o.length;
          d < g;
          d++
        )
          for (var h = o[d], f = 0, _ = l.length; f < _; f++) {
            var k = l[f],
              v = 1 * h.lag + 1 * k.lag,
              p = {
                id: a.id,
                type: a.type,
                source: h.task,
                target: k.task,
                lag: (1 * a.lag || 0) + v
              };
            r.push(
              t._convertToFinishToStartLink(
                k.task,
                p,
                s,
                i,
                h.taskParent,
                k.taskParent
              )
            );
          }
        return e && (n[a.id] = r), r;
      }),
      (t._isAutoSchedulable = function(t) {
        return !1 !== t.auto_scheduling;
      }),
      (t._getImplicitLinks = function(e, n, a, r) {
        var i = [];
        if (this.isSummaryTask(n)) {
          var s,
            o = {};
          for (var u in (this.eachTask(function(t) {
            this.isSummaryTask(t) || (o[t.id] = t);
          }, n.id),
          o)) {
            var c = o[u],
              l = r ? c.$source : c.$target;
            s = !1;
            for (var d = 0; d < l.length; d++) {
              var g = t.getLink(l[d]),
                h = r ? g.target : g.source,
                f = o[h];
              if (
                f &&
                !1 !== c.auto_scheduling &&
                !1 !== f.auto_scheduling &&
                ((g.target == f.id && Math.abs(g.lag) <= f.duration) ||
                  (g.target == c.id && Math.abs(g.lag) <= c.duration))
              ) {
                s = !0;
                break;
              }
            }
            s || i.push({ task: c.id, taskParent: c.parent, lag: a(c) });
          }
        } else i.push({ task: n.id, taskParent: n.parent, lag: 0 });
        return i;
      }),
      (t._getDirectDependencies = function(t, e) {
        for (
          var n = [], a = [], r = e ? t.$source : t.$target, i = 0;
          i < r.length;
          i++
        ) {
          var s = this.getLink(r[i]);
          if (this.isTaskExists(s.source) && this.isTaskExists(s.target)) {
            var o = this.getTask(s.target);
            this._isAutoSchedulable(o) && n.push(this.getLink(r[i]));
          }
        }
        for (i = 0; i < n.length; i++) a = a.concat(this._formatLink(n[i]));
        return a;
      }),
      (t._getInheritedDependencies = function(t, n) {
        var i,
          s = !1,
          o = [];
        if (this.isTaskExists(t.id)) {
          this.getParent(t.id);
          this.eachParent(
            function(t) {
              var u;
              s ||
                (e && (i = n ? a : r)[t.id]
                  ? o.push.apply(o, i[t.id])
                  : this.isSummaryTask(t) &&
                    (this._isAutoSchedulable(t)
                      ? ((u = this._getDirectDependencies(t, n)),
                        e && (i[t.id] = u),
                        o.push.apply(o, u))
                      : (s = !0)));
            },
            t.id,
            this
          );
        }
        return o;
      }),
      (t._getDirectSuccessors = function(t) {
        return this._getDirectDependencies(t, !0);
      }),
      (t._getInheritedSuccessors = function(t) {
        return this._getInheritedDependencies(t, !0);
      }),
      (t._getDirectPredecessors = function(t) {
        return this._getDirectDependencies(t, !1);
      }),
      (t._getInheritedPredecessors = function(t) {
        return this._getInheritedDependencies(t, !1);
      }),
      (t._getSuccessors = function(t, e) {
        var n = this._getDirectSuccessors(t);
        return e ? n : n.concat(this._getInheritedSuccessors(t));
      }),
      (t._getPredecessors = function(t, n) {
        var a,
          r = t.id + n;
        if (e && i[r]) return i[r];
        var s = this._getDirectPredecessors(t);
        return (
          (a = n ? s : s.concat(this._getInheritedPredecessors(t))),
          e && (i[r] = a),
          a
        );
      }),
      (t._convertToFinishToStartLink = function(e, n, a, r, i, s) {
        var o = {
            target: e,
            link: t.config.links.finish_to_start,
            id: n.id,
            lag: n.lag || 0,
            source: n.source,
            preferredStart: null,
            sourceParent: i,
            targetParent: s
          },
          u = 0;
        switch (n.type) {
          case t.config.links.start_to_start:
            u = -a.duration;
            break;
          case t.config.links.finish_to_finish:
            u = -r.duration;
            break;
          case t.config.links.start_to_finish:
            u = -a.duration - r.duration;
            break;
          default:
            u = 0;
        }
        return (o.lag += u), o;
      });
  })((t.config.auto_scheduling = !1)),
  (t.config.auto_scheduling_descendant_links = !1),
  (t.config.auto_scheduling_initial = !0),
  (t.config.auto_scheduling_strict = !1),
  (t.config.auto_scheduling_move_projects = !0),
  function() {
    var e = a(5);
    function n(t, e, n) {
      for (var a, r = [t], i = [], s = {}; r.length > 0; )
        if (!n[(a = r.shift())]) {
          (n[a] = !0), i.push(a);
          for (var o = 0; o < e.length; o++) {
            var u = e[o];
            u.source != a || n[u.target]
              ? u.target != a ||
                n[u.source] ||
                (r.push(u.source), (s[u.id] = !0), e.splice(o, 1), o--)
              : (r.push(u.target), (s[u.id] = !0), e.splice(o, 1), o--);
          }
        }
      var c = [];
      for (var o in s) c.push(o);
      return { tasks: i, links: c };
    }
    (t._autoSchedulingGraph = {
      getVertices: function(t) {
        for (var e, n = {}, a = 0, r = t.length; a < r; a++)
          (n[(e = t[a]).target] = e.target), (n[e.source] = e.source);
        var i,
          s = [];
        for (var a in n) (i = n[a]), s.push(i);
        return s;
      },
      topologicalSort: function(t) {
        for (
          var e = this.getVertices(t), n = {}, a = 0, r = e.length;
          a < r;
          a++
        )
          n[e[a]] = { id: e[a], $source: [], $target: [], $incoming: 0 };
        for (a = 0, r = t.length; a < r; a++) {
          var i = n[t[a].target];
          i.$target.push(a),
            (i.$incoming = i.$target.length),
            n[t[a].source].$source.push(a);
        }
        for (
          var s = e.filter(function(t) {
              return !n[t].$incoming;
            }),
            o = [];
          s.length;

        ) {
          var u = s.pop();
          o.push(u);
          var c = n[u];
          for (a = 0; a < c.$source.length; a++) {
            var l = n[t[c.$source[a]].target];
            l.$incoming--, l.$incoming || s.push(l.id);
          }
        }
        return o;
      },
      _groupEdgesBySource: function(t) {
        for (var e, n = {}, a = 0, r = t.length; a < r; a++)
          n[(e = t[a]).source] || (n[e.source] = []), n[e.source].push(e);
        return n;
      },
      tarjanStronglyConnectedComponents: function(t, e) {
        for (
          var n,
            a = {},
            r = 0,
            i = [],
            s = [],
            o = [],
            u = this._groupEdgesBySource(e),
            c = 0,
            l = t.length;
          c < l;
          c++
        ) {
          void 0 === g((n = t[c])).index && d(n);
        }
        function d(t, e) {
          var n;
          ((l = g(t)).index = r),
            (l.lowLink = r),
            r++,
            e && s.push(e),
            i.push(l),
            (l.onStack = !0);
          for (var a = u[t], c = 0; a && c < a.length; c++)
            if ((n = a[c]).source == t) {
              var l = g(n.source);
              void 0 === (h = g(n.target)).index
                ? (d(n.target, n), (l.lowLink = Math.min(l.lowLink, h.lowLink)))
                : h.onStack &&
                  ((l.lowLink = Math.min(l.lowLink, h.index)), s.push(n));
            }
          if (l.lowLink == l.index) {
            var h,
              f = { tasks: [], links: [] };
            do {
              var _ = s.pop();
              ((h = i.pop()).onStack = !1),
                f.tasks.push(h.id),
                _ && f.links.push(_.id);
            } while (h.id != l.id);
            o.push(f);
          }
        }
        return o;
        function g(t) {
          return (
            a[t] ||
              (a[t] = {
                id: t,
                onStack: !1,
                index: void 0,
                lowLink: void 0
              }),
            a[t]
          );
        }
      }
    }),
      (t._autoSchedulingPath = {
        getKey: function(t) {
          return t.lag + "_" + t.link + "_" + t.source + "_" + t.target;
        },
        getVirtualRoot: function() {
          return t.mixin(t.getSubtaskDates(), {
            id: t.config.root_id,
            type: t.config.types.project,
            $source: [],
            $target: [],
            $virtual: !0
          });
        },
        filterDuplicates: function(t) {
          for (var e = {}, n = 0; n < t.length; n++) {
            var a = this.getKey(t[n]);
            e[a] ? (t.splice(n, 1), n--) : (e[a] = !0);
          }
          return t;
        },
        getLinkedTasks: function(e, n) {
          var a = [e],
            r = !1;
          t._isLinksCacheEnabled() || (t._startLinksCache(), (r = !0));
          for (var i = [], s = {}, o = 0; o < a.length; o++)
            this._getLinkedTasks(a[o], s, n);
          for (var o in s) i.push(s[o]);
          return r && t._endLinksCache(), i;
        },
        _getLinkedTasks: function(e, n, a, r) {
          var i = void 0 === e ? t.config.root_id : e,
            s = n || {},
            o = t.isTaskExists(i) ? t.getTask(i) : this.getVirtualRoot(),
            u = t._getSuccessors(o, r),
            c = [];
          a && (c = t._getPredecessors(o, r));
          for (var l, d = [], g = 0; g < u.length; g++)
            s[(l = this.getKey(u[g]))] || ((s[l] = u[g]), d.push(u[g]));
          for (g = 0; g < c.length; g++)
            s[(l = this.getKey(c[g]))] || ((s[l] = c[g]), d.push(c[g]));
          for (g = 0; g < d.length; g++) {
            var h = d[g].sourceParent == d[g].targetParent;
            this._getLinkedTasks(d[g].target, s, !0, h);
          }
          if (t.hasChild(o.id)) {
            var f = t.getChildren(o.id);
            for (g = 0; g < f.length; g++)
              this._getLinkedTasks(f[g], s, !0, !0);
          }
          return d;
        },
        findLoops: function(n) {
          var a = [];
          e.forEach(n, function(t) {
            t.target == t.source && a.push([t.target, t.source]);
          });
          var r = t._autoSchedulingGraph,
            i = r.getVertices(n),
            s = r.tarjanStronglyConnectedComponents(i, n);
          return (
            e.forEach(s, function(t) {
              t.tasks.length > 1 && a.push(t);
            }),
            a
          );
        }
      }),
      (t._autoSchedulingDateResolver = {
        isFirstSmaller: function(e, n, a) {
          return !!(e.valueOf() < n.valueOf() && t._hasDuration(e, n, a));
        },
        isSmallerOrDefault: function(t, e, n) {
          return !(t && !this.isFirstSmaller(t, e, n));
        },
        resolveRelationDate: function(e, n, a) {
          for (var r, i = null, s = null, o = null, u = 0; u < n.length; u++) {
            var c = n[u];
            (e = c.target), (o = c.preferredStart), (r = t.getTask(e));
            var l = this.getConstraintDate(c, a, r);
            this.isSmallerOrDefault(o, l, r) &&
              this.isSmallerOrDefault(i, l, r) &&
              ((i = l), (s = c.id));
          }
          return (
            i &&
              (i = t.getClosestWorkTime({
                date: i,
                dir: "future",
                task: t.getTask(e)
              })),
            { link: s, task: e, start_date: i }
          );
        },
        getConstraintDate: function(e, n, a) {
          var r = n(e.source),
            i = a,
            s = t.getClosestWorkTime({ date: r, dir: "future", task: i });
          return (
            r &&
              e.lag &&
              1 * e.lag == e.lag &&
              (s = t.calculateEndDate({
                start_date: r,
                duration: 1 * e.lag,
                task: i
              })),
            s
          );
        }
      }),
      (t._autoSchedulingPlanner = {
        generatePlan: function(e) {
          for (
            var n,
              a,
              r = t._autoSchedulingGraph.topologicalSort(e),
              i = {},
              s = {},
              o = 0,
              u = r.length;
            o < u;
            o++
          ) {
            (n = r[o]),
              !1 !== (_ = t.getTask(n)).auto_scheduling &&
                ((i[n] = []), (s[n] = null));
          }
          function c(e) {
            var n = s[e],
              a = t.getTask(e);
            return n && (n.start_date || n.end_date)
              ? n.end_date
                ? n.end_date
                : t.calculateEndDate({
                    start_date: n.start_date,
                    duration: a.duration,
                    task: a
                  })
              : a.end_date;
          }
          for (o = 0, u = e.length; o < u; o++)
            i[(a = e[o]).target] && i[a.target].push(a);
          var l = t._autoSchedulingDateResolver,
            d = [];
          for (o = 0; o < r.length; o++) {
            var g = r[o],
              h = l.resolveRelationDate(g, i[g] || [], c);
            if (h.start_date && t.isLinkExists(h.link)) {
              var f = t.getLink(h.link),
                _ = t.getTask(g),
                k = t.getTask(f.source);
              if (
                _.start_date.valueOf() !== h.start_date.valueOf() &&
                !1 ===
                  t.callEvent("onBeforeTaskAutoSchedule", [
                    _,
                    h.start_date,
                    f,
                    k
                  ])
              )
                continue;
            }
            (s[g] = h), h.start_date && d.push(h);
          }
          return d;
        },
        applyProjectPlan: function(e) {
          for (var n, a, r, i, s = [], o = 0; o < e.length; o++)
            if (((r = null), (i = null), (n = e[o]).task)) {
              (a = t.getTask(n.task)),
                n.link && ((r = t.getLink(n.link)), (i = t.getTask(r.source)));
              var u = null;
              n.start_date &&
                a.start_date.valueOf() != n.start_date.valueOf() &&
                (u = n.start_date),
                u &&
                  ((a.start_date = u),
                  (a.end_date = t.calculateEndDate(a)),
                  s.push(a.id),
                  t.callEvent("onAfterTaskAutoSchedule", [a, u, r, i]));
            }
          return s;
        }
      }),
      (t._autoSchedulingPreferredDates = function(e, n) {
        for (var a = 0; a < n.length; a++) {
          var r = n[a],
            i = t.getTask(r.target);
          (t.config.auto_scheduling_strict && r.target != e) ||
            (r.preferredStart = new Date(i.start_date));
        }
      }),
      (t._autoSchedule = function(e, n, a) {
        if (!1 !== t.callEvent("onBeforeAutoSchedule", [e])) {
          t._autoscheduling_in_progress = !0;
          var r = [],
            i = t._autoSchedulingPath.findLoops(n);
          if (i.length) t.callEvent("onAutoScheduleCircularLink", [i]);
          else {
            var s = t._autoSchedulingPlanner;
            t._autoSchedulingPreferredDates(e, n);
            var o = s.generatePlan(n);
            (r = s.applyProjectPlan(o)), a && a(r);
          }
          return (
            (t._autoscheduling_in_progress = !1),
            t.callEvent("onAfterAutoSchedule", [e, r]),
            r
          );
        }
      }),
      (t.autoSchedule = function(e, n) {
        n = void 0 === n || !!n;
        var a = t._autoSchedulingPath.getLinkedTasks(e, n),
          r = (a.length, Date.now());
        t._autoSchedule(e, a, t._finalizeAutoSchedulingChanges);
        Date.now();
      }),
      (t._finalizeAutoSchedulingChanges = function(e) {
        var n = !1;
        function a() {
          for (var n = 0; n < e.length; n++) t.updateTask(e[n]);
        }
        1 == e.length
          ? t.eachParent(function e(a) {
              if (!n) {
                var r = a.start_date.valueOf(),
                  i = a.end_date.valueOf();
                if (
                  (t.resetProjectDates(a),
                  a.start_date.valueOf() == r && a.end_date.valueOf() == i)
                )
                  for (
                    var s = t.getChildren(a.id), o = 0;
                    !n && o < s.length;
                    o++
                  )
                    e(t.getTask(s[o]));
                else n = !0;
              }
            }, e[0])
          : e.length && (n = !0),
          n ? t.batchUpdate(a) : a();
      }),
      (t.isCircularLink = function(e) {
        return !!t._getConnectedGroup(e);
      }),
      (t._getConnectedGroup = function(e) {
        var n = t._autoSchedulingPath,
          a = n.getLinkedTasks();
        t.isLinkExists(e.id) || (a = a.concat(t._formatLink(e)));
        for (var r = n.findLoops(a), i = 0; i < r.length; i++)
          for (var s = r[i].links, o = 0; o < s.length; o++)
            if (s[o] == e.id) return r[i];
        return null;
      }),
      (t.findCycles = function() {
        var e = t._autoSchedulingPath,
          n = e.getLinkedTasks();
        return e.findLoops(n);
      }),
      (t._attachAutoSchedulingHandlers = function() {
        var e, n;
        (t._autoScheduleAfterLinkChange = function(e, n) {
          t.config.auto_scheduling &&
            !this._autoscheduling_in_progress &&
            t.autoSchedule(n.source);
        }),
          t.attachEvent("onAfterLinkUpdate", t._autoScheduleAfterLinkChange),
          t.attachEvent("onAfterLinkAdd", t._autoScheduleAfterLinkChange),
          t.attachEvent("onAfterLinkDelete", function(t, e) {
            if (
              this.config.auto_scheduling &&
              !this._autoscheduling_in_progress &&
              this.isTaskExists(e.target)
            ) {
              var n = this.getTask(e.target),
                a = this._getPredecessors(n);
              a.length && this.autoSchedule(a[0].source, !1);
            }
          }),
          t.attachEvent("onParse", function() {
            t.config.auto_scheduling &&
              t.config.auto_scheduling_initial &&
              t.autoSchedule();
          }),
          (t._preventCircularLink = function(e, n) {
            return (
              !t.isCircularLink(n) ||
              (t.callEvent("onCircularLinkError", [n, t._getConnectedGroup(n)]),
              !1)
            );
          }),
          (t._preventDescendantLink = function(e, n) {
            var a = t.getTask(n.source),
              r = t.getTask(n.target);
            return !(
              !t.config.auto_scheduling_descendant_links &&
              ((t.isChildOf(a.id, r.id) && t.isSummaryTask(r)) ||
                (t.isChildOf(r.id, a.id) && t.isSummaryTask(a)))
            );
          }),
          t.attachEvent("onBeforeLinkAdd", t._preventCircularLink),
          t.attachEvent("onBeforeLinkAdd", t._preventDescendantLink),
          t.attachEvent("onBeforeLinkUpdate", t._preventCircularLink),
          t.attachEvent("onBeforeLinkUpdate", t._preventDescendantLink),
          (t._datesNotEqual = function(t, e, n, a) {
            return t.valueOf() > e.valueOf()
              ? this._hasDuration({ start_date: e, end_date: t, task: a })
              : this._hasDuration({
                  start_date: t,
                  end_date: e,
                  task: n
                });
          }),
          (t._notEqualTaskDates = function(e, n) {
            if (
              this._datesNotEqual(e.start_date, n.start_date, e, n) ||
              ((this._datesNotEqual(e.end_date, n.end_date, e, n) ||
                e.duration != n.duration) &&
                e.type != t.config.types.milestone)
            )
              return !0;
          }),
          t.attachEvent("onBeforeTaskDrag", function(a, r, i) {
            return (
              t.config.auto_scheduling &&
                t.config.auto_scheduling_move_projects &&
                ((e = t._autoSchedulingPath.getLinkedTasks(a, !0)), (n = a)),
              !0
            );
          }),
          (t._autoScheduleAfterDND = function(a, r) {
            if (t.config.auto_scheduling && !this._autoscheduling_in_progress) {
              var i = this.getTask(a);
              t._notEqualTaskDates(r, i) &&
                (t.config.auto_scheduling_move_projects && n == a
                  ? (t.calculateDuration(r) != t.calculateDuration(i) &&
                      (function(e, n) {
                        for (var a = !1, r = 0; r < n.length; r++) {
                          var i = t.getLink(n[r].id);
                          (i.type != t.config.links.start_to_start &&
                            i.type != t.config.links.start_to_finish) ||
                            (n.splice(r, 1), r--, (a = !0));
                        }
                        if (a) {
                          var s = {};
                          for (r = 0; r < n.length; r++) s[n[r].id] = !0;
                          var o = t._autoSchedulingPath.getLinkedTasks(e, !0);
                          for (r = 0; r < o.length; r++)
                            s[o[r].id] || n.push(o[r]);
                        }
                      })(a, e),
                    t._autoSchedule(a, e, t._finalizeAutoSchedulingChanges))
                  : t.autoSchedule(i.id));
            }
            return (e = null), (n = null), !0;
          }),
          (t._lightBoxChangesHandler = function(e, n) {
            if (t.config.auto_scheduling && !this._autoscheduling_in_progress) {
              var a = this.getTask(e);
              t._notEqualTaskDates(n, a) && (t._autoschedule_lightbox_id = e);
            }
            return !0;
          }),
          (t._lightBoxSaveHandler = function(e, n) {
            return (
              t.config.auto_scheduling &&
                !this._autoscheduling_in_progress &&
                t._autoschedule_lightbox_id &&
                t._autoschedule_lightbox_id == e &&
                ((t._autoschedule_lightbox_id = null), t.autoSchedule(n.id)),
              !0
            );
          }),
          t.attachEvent("onBeforeTaskChanged", function(e, n, a) {
            return t._autoScheduleAfterDND(e, a);
          }),
          t.attachEvent("onLightboxSave", t._lightBoxChangesHandler),
          t.attachEvent("onAfterTaskUpdate", t._lightBoxSaveHandler);
      }),
      t.attachEvent("onGanttReady", function() {
        t._attachAutoSchedulingHandlers(),
          (t._attachAutoSchedulingHandlers = function() {});
      }),
      (t.getConnectedGroup = function(e) {
        var a = t._autoSchedulingPath.getLinkedTasks();
        return void 0 !== e
          ? t.getTask(e).type == t.config.types.project
            ? { tasks: [], links: [] }
            : n(e, a, {})
          : (function(t) {
              for (var e, a, r, i = {}, s = [], o = 0; o < t.length; o++)
                (e = t[o].source),
                  (a = t[o].target),
                  (r = null),
                  i[e] ? i[a] || (r = a) : (r = e),
                  r && s.push(n(r, t, i));
              return s;
            })(a);
      });
  }
);
