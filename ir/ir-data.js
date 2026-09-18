/**
 * NEWON IR — structured content (language-agnostic + string keys).
 * Status enum: released | current | in-development | planned | long-term
 */
window.NEWON_IR_DATA = (function () {
  "use strict";

  var STATUS = {
    RELEASED: "released",
    CURRENT: "current",
    IN_DEVELOPMENT: "in-development",
    PLANNED: "planned",
    LONG_TERM: "long-term",
  };

  /** Leave null / empty — never invent figures */
  var investment = {
    investmentTarget: null,
    tractionMetrics: null,
    fundUse: ["growth", "product", "data", "infrastructure", "global"],
  };

  var snapshot = [
    { value: "11", labelKey: "snap.live", noteKey: "snap.liveNote" },
    { value: "2", labelKey: "snap.upcoming", noteKey: "snap.upcomingNote" },
    { value: "13", labelKey: "snap.total", noteKey: "snap.totalNote" },
  ];

  /** Traction: never invent figures — tracking state only when unknown */
  var tractionMetrics = [
    { key: "installs", state: "tracking" },
    { key: "registered", state: "tracking" },
    { key: "mau", state: "tracking" },
    { key: "paid", state: "tracking" },
    { key: "growth", state: "measuring" },
  ];

  var focusLayers = [
    { n: "01", key: "primary" },
    { n: "02", key: "secondary" },
    { n: "03", key: "ecosystem" },
  ];

  var flywheel = [
    "acq", "core", "plus", "cross", "multi", "sub", "retain", "ltv"
  ];

  var marketBlocks = [
    { n: "01", key: "tam" },
    { n: "02", key: "sam" },
    { n: "03", key: "som" },
  ];

  var marketSam = [
    "health", "productivity", "finance", "family", "fitness", "food", "travel"
  ];

  var competeCols = [
    { key: "single" },
    { key: "super" },
    { key: "newon" },
  ];

  var gtmFlow = [
    "founder", "organic", "aso", "core", "referral", "plus", "retain"
  ];

  var measureCards = [
    { n: "01", key: "acq" },
    { n: "02", key: "act" },
    { n: "03", key: "ret" },
    { n: "04", key: "eng" },
    { n: "05", key: "conv" },
    { n: "06", key: "rev" },
    { n: "07", key: "cross" },
  ];

  var whyNow = [
    { n: "01", key: "ai" },
    { n: "02", key: "sub" },
    { n: "03", key: "frag" },
    { n: "04", key: "global" },
  ];

  var revLongTerm = ["rev.lt.i1", "rev.lt.i2", "rev.lt.i3", "rev.lt.i4"];

  var lifeAxes = [
    { key: "axis.finance" },
    { key: "axis.health" },
    { key: "axis.family" },
    { key: "axis.growth" },
    { key: "axis.travel" },
    { key: "axis.fitness" },
    { key: "axis.food" },
  ];

  var strategySteps = [
    { n: "01", key: "build" },
    { n: "02", key: "validate" },
    { n: "03", key: "focus" },
    { n: "04", key: "connect" },
    { n: "05", key: "scale" },
  ];

  var categories = [
    {
      id: "daily",
      labelKey: "cat.daily",
      products: [
        {
          id: "ox-month",
          name: "OX MONTH",
          icon: "/ox-month-logo.png",
          href: "/ko/oxmonth/",
          status: STATUS.RELEASED,
          currentKeys: ["ox.cur1", "ox.cur2", "ox.cur3"],
          nextKeys: ["ox.next1", "ox.next2", "ox.next3", "ox.next4"],
          longKey: "ox.long",
        },
      ],
    },
    {
      id: "finance",
      labelKey: "cat.finance",
      products: [
        {
          id: "subping",
          name: "SubPing",
          icon: "/subping-logo.png",
          href: "/ko/subping/",
          status: STATUS.RELEASED,
          growthKey: "growth.subping",
          currentKeys: ["sub.cur1", "sub.cur2"],
          nextKeys: ["sub.next1", "sub.next2", "sub.next3", "sub.next4"],
          longKey: "sub.long",
        },
        {
          id: "savy",
          name: "Savy",
          icon: "/savy-logo.png",
          href: "/ko/savy/",
          status: STATUS.RELEASED,
          growthKey: "growth.savy",
          currentKeys: ["savy.cur1", "savy.cur2"],
          nextKeys: ["savy.next1", "savy.next2", "savy.next3", "savy.next4"],
        },
        {
          id: "piggyup",
          name: "PiggyUp",
          icon: "/piggyup-logo.png",
          href: "/ko/piggyup/",
          status: STATUS.RELEASED,
          growthKey: "growth.piggyup",
          currentKeys: ["pig.cur1", "pig.cur2"],
          nextKeys: ["pig.next1", "pig.next2", "pig.next3", "pig.next4"],
        },
      ],
    },
    {
      id: "health",
      labelKey: "cat.health",
      products: [
        {
          id: "pillmate",
          name: "Pillmate",
          icon: "/pillmate-logo.png",
          href: "/ko/pillmate/",
          status: STATUS.RELEASED,
          growthKey: "growth.pillmate",
          currentKeys: ["pill.cur1", "pill.cur2", "pill.cur3"],
          nextKeys: ["pill.next1", "pill.next2", "pill.next3"],
          cautionKey: "pill.caution",
        },
        {
          id: "fiton",
          name: "FitOn",
          icon: "/fiton-logo.png",
          href: "/ko/fiton/",
          status: STATUS.IN_DEVELOPMENT,
          growthKey: "growth.fiton",
          currentKeys: ["fit.cur1", "fit.cur2", "fit.cur3"],
          nextKeys: ["fit.next1", "fit.next2", "fit.next3"],
          longKey: "fit.long",
        },
        {
          id: "eaton",
          name: "EatOn",
          icon: "/eaton-logo.png",
          href: "/ko/eaton/",
          status: STATUS.IN_DEVELOPMENT,
          growthKey: "growth.eaton",
          currentKeys: ["eat.cur1", "eat.cur2", "eat.cur3"],
          nextKeys: ["eat.next1", "eat.next2", "eat.next3"],
          longKey: "eat.long",
        },
      ],
    },
    {
      id: "family",
      labelKey: "cat.family",
      products: [
        {
          id: "babylog",
          name: "BabyLog",
          icon: "/babylog-logo.png",
          href: "/ko/babylog/",
          status: STATUS.RELEASED,
          growthKey: "growth.babylog",
          currentKeys: ["baby.cur1", "baby.cur2", "baby.cur3"],
          nextKeys: ["baby.next1", "baby.next2", "baby.next3"],
          longKey: "baby.long",
        },
        {
          id: "petlog",
          name: "PetLog",
          icon: "/petlog-logo.png",
          href: "/ko/petlog/",
          status: STATUS.RELEASED,
          growthKey: "growth.petlog",
          currentKeys: ["pet.cur1", "pet.cur2", "pet.cur3"],
          nextKeys: ["pet.next1", "pet.next2", "pet.next3"],
          longKey: "pet.long",
        },
      ],
    },
    {
      id: "growth",
      labelKey: "cat.growth",
      products: [
        {
          id: "goalup",
          name: "GoalUp",
          icon: "/goalup-logo.png",
          href: "/ko/goalup/",
          status: STATUS.RELEASED,
          growthKey: "growth.goalup",
          currentKeys: ["goal.cur1", "goal.cur2"],
          nextKeys: ["goal.next1", "goal.next2", "goal.next3"],
        },
        {
          id: "countup",
          name: "CountUp",
          icon: "/countup-logo.png",
          href: "/ko/countup/",
          status: STATUS.RELEASED,
          growthKey: "growth.countup",
          currentKeys: ["count.cur1", "count.cur2"],
          nextKeys: ["count.next1", "count.next2", "count.next3"],
        },
      ],
    },
    {
      id: "travel",
      labelKey: "cat.travel",
      products: [
        {
          id: "my-world",
          name: "My World",
          icon: "/myworld-logo.png",
          href: "/ko/myworld/",
          status: STATUS.RELEASED,
          growthKey: "growth.myworld",
          currentKeys: ["world.cur1", "world.cur2"],
          nextKeys: ["world.next1", "world.next2", "world.next3"],
          plannedNoteKey: "world.planned",
        },
      ],
    },
    {
      id: "platform",
      labelKey: "cat.platform",
      products: [
        {
          id: "newon-plus",
          name: "Newon+",
          icon: "/newon-plus-logo.png",
          href: "/ko/newon/",
          status: STATUS.RELEASED,
          growthKey: "growth.newonplus",
          featured: true,
          currentKeys: ["plus.cur1", "plus.cur2", "plus.cur3"],
          nextKeys: ["plus.next1", "plus.next2", "plus.next3", "plus.next4"],
          taglineKey: "plus.tagline",
        },
      ],
    },
  ];

  var nextProducts = [];

  var growthMap = [
    { name: "SubPing", icon: "/subping-logo.png", flowKey: "growth.subping" },
    { name: "Savy", icon: "/savy-logo.png", flowKey: "growth.savy" },
    { name: "Pillmate", icon: "/pillmate-logo.png", flowKey: "growth.pillmate" },
    { name: "BabyLog", icon: "/babylog-logo.png", flowKey: "growth.babylog" },
    { name: "PetLog", icon: "/petlog-logo.png", flowKey: "growth.petlog" },
    { name: "GoalUp", icon: "/goalup-logo.png", flowKey: "growth.goalup" },
    { name: "CountUp", icon: "/countup-logo.png", flowKey: "growth.countup" },
    { name: "PiggyUp", icon: "/piggyup-logo.png", flowKey: "growth.piggyup" },
    { name: "My World", icon: "/myworld-logo.png", flowKey: "growth.myworld" },
    { name: "FitOn", icon: "/fiton-logo.png", flowKey: "growth.fiton", next: true },
    { name: "EatOn", icon: "/eaton-logo.png", flowKey: "growth.eaton", next: true },
    { name: "Newon+", icon: "/newon-plus-logo.png", flowKey: "growth.newonplus", featured: true },
  ];

  var plusFeatures = [
    { key: "plus.f1" },
    { key: "plus.f2" },
    { key: "plus.f3" },
    { key: "plus.f4" },
    { key: "plus.f5" },
    { key: "plus.f6" },
  ];

  var plusOrbit = [
    { name: "OX MONTH", icon: "/ox-month-logo.png" },
    { name: "SubPing", icon: "/subping-logo.png" },
    { name: "Savy", icon: "/savy-logo.png" },
    { name: "Pillmate", icon: "/pillmate-logo.png" },
    { name: "BabyLog", icon: "/babylog-logo.png" },
    { name: "PetLog", icon: "/petlog-logo.png" },
    { name: "GoalUp", icon: "/goalup-logo.png" },
    { name: "CountUp", icon: "/countup-logo.png" },
    { name: "PiggyUp", icon: "/piggyup-logo.png" },
    { name: "My World", icon: "/myworld-logo.png" },
    { name: "FitOn", icon: "/fiton-logo.png", next: true },
    { name: "EatOn", icon: "/eaton-logo.png", next: true },
  ];

  var intelligenceFlow = ["idata", "icontext", "iai", "iinsight", "irec", "iaction"];

  var intelligenceExamples = [
    { name: "Savy", flowKey: "intel.savy" },
    { name: "GoalUp", flowKey: "intel.goal" },
    { name: "FitOn", flowKey: "intel.fit", next: true },
    { name: "EatOn", flowKey: "intel.eat", next: true },
    { name: "My World", flowKey: "intel.world" },
  ];

  var revenueLayers = [
    {
      n: "01",
      key: "rev.sub",
      timing: "current",
      items: ["rev.sub.i1", "rev.sub.i2"],
    },
    {
      n: "02",
      key: "rev.mem",
      timing: "next",
      items: ["rev.mem.i1", "rev.mem.i2", "rev.mem.i3"],
    },
    {
      n: "03",
      key: "rev.com",
      timing: "next",
      items: [
        "rev.com.i1",
        "rev.com.i2",
        "rev.com.i3",
        "rev.com.i4",
        "rev.com.i5",
        "rev.com.i6",
        "rev.com.i7",
        "rev.com.i8",
      ],
    },
    {
      n: "04",
      key: "rev.b2b",
      timing: "current",
      items: ["rev.b2b.i1", "rev.b2b.i2", "rev.b2b.i3", "rev.b2b.i4"],
    },
  ];

  var commerce = {
    store: [
      { name: "Pillmate", itemsKey: ["com.pill"], status: STATUS.PLANNED },
      { name: "BabyLog", itemsKey: ["com.baby"], status: STATUS.PLANNED },
      { name: "PetLog", itemsKey: ["com.pet"], status: STATUS.PLANNED },
      { name: "FitOn", itemsKey: ["com.fit1", "com.fit2"], status: STATUS.LONG_TERM },
      { name: "EatOn", itemsKey: ["com.eat1", "com.eat2"], status: STATUS.LONG_TERM },
      { name: "My World", itemsKey: ["com.world"], status: STATUS.PLANNED },
    ],
    marketplace: [
      { name: "BabyLog", itemsKey: ["mkt.baby"], status: STATUS.PLANNED },
      { name: "PetLog", itemsKey: ["mkt.pet"], status: STATUS.PLANNED },
      { name: "FitOn", itemsKey: ["mkt.fit"], status: STATUS.LONG_TERM },
    ],
    booking: [
      { name: "PetLog", itemsKey: ["book.pet1", "book.pet2"], status: STATUS.PLANNED },
      { name: "BabyLog", itemsKey: ["book.baby"], status: STATUS.PLANNED },
      { name: "My World", itemsKey: ["book.world1", "book.world2"], status: STATUS.PLANNED },
      { name: "FitOn", itemsKey: ["book.fit"], status: STATUS.LONG_TERM },
    ],
  };

  var roadmap = [
    {
      id: "p1",
      phase: "01",
      key: "road.p1",
      state: "done",
      periodKey: "road.p1.period",
      goalKey: "road.p1.goal",
      items: ["road.p1.i1", "road.p1.i2", "road.p1.i3", "road.p1.i4"],
    },
    {
      id: "p2",
      phase: "02",
      key: "road.p2",
      state: "current",
      periodKey: "road.p2.period",
      goalKey: "road.p2.goal",
      items: ["road.p2.i1", "road.p2.i2", "road.p2.i3", "road.p2.i4"],
    },
    {
      id: "p3",
      phase: "03",
      key: "road.p3",
      state: "next",
      periodKey: "road.p3.period",
      goalKey: "road.p3.goal",
      items: ["road.p3.i1", "road.p3.i2", "road.p3.i3", "road.p3.i4"],
    },
    {
      id: "p4",
      phase: "04",
      key: "road.p4",
      state: "later",
      periodKey: "road.p4.period",
      goalKey: "road.p4.goal",
      items: ["road.p4.i1", "road.p4.i2", "road.p4.i3", "road.p4.i4"],
    },
  ];

  return {
    STATUS: STATUS,
    investment: investment,
    snapshot: snapshot,
    tractionMetrics: tractionMetrics,
    focusLayers: focusLayers,
    flywheel: flywheel,
    marketBlocks: marketBlocks,
    marketSam: marketSam,
    competeCols: competeCols,
    gtmFlow: gtmFlow,
    measureCards: measureCards,
    whyNow: whyNow,
    revLongTerm: revLongTerm,
    lifeAxes: lifeAxes,
    strategySteps: strategySteps,
    categories: categories,
    nextProducts: nextProducts,
    growthMap: growthMap,
    plusFeatures: plusFeatures,
    plusOrbit: plusOrbit,
    intelligenceFlow: intelligenceFlow,
    intelligenceExamples: intelligenceExamples,
    revenueLayers: revenueLayers,
    commerce: commerce,
    roadmap: roadmap,
  };
})();
