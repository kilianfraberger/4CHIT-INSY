use scott;
//1
select *
from depts;
db.depts.find({});

//2
select ENAME,JOB,SAL
from emps
where dept_id=10;
db.emps.find(
  { dept_id: 10 },
    { ENAME: 1, JOB: 1, SAL: 1, _id: 0 }
  );

//3
db.emps.find(
  { JOB: "CLERK" },
  { ENAME: 1, JOB: 1, SAL: 1, _id: 0 }
);

//4
db.emps.find(
  { dept_id: { $ne: 10 } }
);

//5
db.emps.find({
  $expr: { $gt: ["$COMM", "$SAL"] }
});

//6
db.emps.find({
  HIREDATE: ISODate("1981-12-03T00:00:00Z")
});

db.emps.find({HIREDATE: new Date("1981-12-03")},{_id:0})

//7
db.emps.find({
  $or: [
    { SAL: { $lt: 1250 } },
    { SAL: { $gt: 1600 } }
  ]
},
{
  ENAME: 1, SAL: 1, _id: 0
});

//8
db.emps.find({
  JOB: { $nin: ["MANAGER", "PRESIDENT"] }
});

//9
db.emps.find({
ENAME: { $regex: /^..A/ }
});

//10
db.emps.find({
  COMM: { $ne: null }
},
{
  id: 1, ENAME: 1, JOB: 1, _id: 0
});

//*
db.emps.find({
  $and: [
    { dept_id: { $ne: 10 } },
    { dept_id: { $ne: 30 } }
  ]
});

//11
db.emps.find().sort({ COMM: 1 });

//12
db.emps.find({ JOB: { $nin: ['Manager', 'President'] } })
       .sort({ dept_id: 1, HIREDATE: -1 });

//13
db.emps.find({ $expr: { $eq: [{ $strLenCP: "$ENAME" }, 6] } }, { ENAME: 1 });

//14
db.emps.aggregate([
  { $match: { dept_id: 30 } },
  { $project: {_id:0, "Mitarbeiter - Position": { $concat: ["$ENAME", " - ", "$JOB"] } } }
]);


//15
db.emps.aggregate([
  {
    $project: {
      SAL_COMM_SUM: { $add: ["$SAL", "$COMM"] },
      _id:0
    }
  }
]);

//16
db.emps.aggregate([
  {
    $project: {
      Name: "$ENAME",
      Monthly: "$SAL",
      Daily: { $divide: ["$SAL", 22] },
      Hourly: { $divide: ["$SAL", { $multiply: [22, 8] }] }
    }
  }
]);

//17
db.emps.aggregate([
  {
    $group: {
      _id: null,
      totalSalary: { $sum: "$SAL" }
    }
  }
]);

//nach dept_id gruppiert
db.emps.aggregate([
  {
    $group: {
      _id: "$dept_id",
      totalSalary: { $sum: "$SAL" }
    }
  }
]);


//18
db.emps.aggregate([
  {
    $addFields: {
      commFixed: {
        $cond: [
          { $not: ["$comm"] }, // Feld fehlt
          250,                                         // dann 250
          "$comm"                                      // sonst comm
        ]
      }
    }
  },
  {
    $group: {
      _id: null,
      durchschnittliche_prämie: { $avg: "$commFixed" }
    }
  }
]);
db.emps.aggregate([
  {
    $addFields: {
      commFixed: {
        $cond: [
          { $eq: [ { $type: "$comm" }, "missing" ] }, // Feld ist unset
          250,                                        // dann 250
          "$comm"                                     // sonst comm
        ]
      }
    }
  },
  {
    $group: {
      _id: null,
      durchschnittliche_prämie: { $avg: "$commFixed" }
    }
  }
])


db.emps.find()

//19
db.emps.aggregate([
  { $match: { dept_id: 30 } },
  {
    $project: {
      "CountOfSal": { $cond: { if: { $ne: ["$sal", null] }, then: 1, else: 0 } },
      "CountOfComm": { $cond: { if: { $ne: ["$comm", null] }, then: 1, else: 0 } }
    }
  },
  {
    $group: {
      _id: null,
      "CountOfSal": { $sum: "$CountOfSal" },
      "CountOfComm": { $sum: "$CountOfComm" }
    }
  }
])


//20
db.emps.aggregate([
  { $group: { _id: "$JOB" } },
  { $count: "distinctJobCount" }
])

//21
db.emps.aggregate([
  {
    $group: {
      _id: "$parent_id"
    }
  }
])

//21/2
db.emps.aggregate([
  {
    $match: {
      parent_id: { $ne: null }
    }
  },
  {
    $group: {
      _id: "$parent_id"
    }
  },
  {
    $count: "distinct_parent_id_count"
  }
])

//22
db.emps.aggregate([
  {
    $match: { dept_id: 30 }
  },
  {
    $group: {
      _id: null,
      SUM_SALARY: { $sum: "$SAL" },
      COUNT_SALARY: { $sum: { $cond: [{ $ne: ["$SAL", null] }, 1, 0] } },
      AVG_SALARY: {
        $avg: {
          $cond: [{ $ne: ["$SAL", null] }, "$SAL", null]
        }
      },
      SUM_COMMISSION: {
        $sum: { $ifNull: ["$COMM", 0] }
      },
      COUNT_COMMISSION: {
        $sum: { $cond: [{ $ne: ["$COMM", null] }, 1, 0] }
      },
      AVG_COMMISSION: {
        $avg: { $ifNull: ["$COMM", 0] }
      }
    }
  }
])

//23
db.emps.aggregate([
  {
    $match: {
      JOB: { $nin: ['MANAGER', 'PRESIDENT'] }
    }
  },
  {
    $group: {
      _id: "$dept_id",  // GROUP BY dept_id
      UNIQUE_JOBS: { $addToSet: "$JOB" }  // DISTINCT JOB
    }
  },
  {
    $project: {
      dept_id: "$_id",
      UNIQUE_JOBS: { $size: "$UNIQUE_JOBS" }  // Zählt die Anzahl der verschiedenen JOBs
    }
  }
]);

//24
db.emps.aggregate([
  {
    $group: {
      _id: "$dept_id",
      employee_count: { $sum: 1 }
    }
  },
  {
    $group: {
      _id: null,
      average_employee_count: { $avg: "$employee_count" }
    }
  }
])

//25
db.emps.find({
  JOB: { $in: ["MANAGER", "PRESIDENT"] }
})

//26
db.emps.aggregate([
  {
    $match: {
      $expr: {
        $gt: ["$COMM", { $multiply: [0.25, "$SAL"] }]
      }
    }
  },
  {
    $project: {
      _id: 0,
      ENAME: 1,
      JOB: 1,
      COMM: 1
    }
  }
])

//27
db.emps.aggregate([
  {
    $project: {
      totalCompensation: {
        $add: [
          "$SAL",
          { $ifNull: ["$COMM", 0] }
        ]
      }
    }
  },
  {
    $group: {
      _id: null,
      MIN_TOTAL_COMPENSATION: { $min: "$totalCompensation" }
    }
  },
  {
    $project: {
      _id: 0,
      MIN_TOTAL_COMPENSATION: 1
    }
  }
])

//28
db.emps.aggregate([
  {
    $group: {
      _id: null,
      OLDEST_EMPLOYEE_HIRED: { $min: "$HIREDATE" }
    }
  },
  {
    $project: {
      _id: 0,
      OLDEST_EMPLOYEE_HIRED: 1
    }
  }
])

//29
db.emps.aggregate([
  {
    $group: {
      _id: { dept_id: "$dept_id", JOB: "$JOB" },
      NUMBER_OF_EMPLOYEES: { $sum: 1 }
    }
  },
  {
    $sort: {
      "_id.dept_id": 1,
      "_id.JOB": 1
    }
  },
  {
    $project: {
      _id: 0,
      dept_id: "$_id.dept_id",
      JOB: "$_id.JOB",
      NUMBER_OF_EMPLOYEES: 1
    }
  }
]);

//30
db.emps.aggregate([
  {
    $group: {
      _id: "$dept_id",
      MAX_INCOME: {
        $max: {
          $add: [
            "$SAL",
            { $ifNull: ["$COMM", 0] }
          ]
        }
      }
    }
  },
  {
    $group: {
      _id: null,
      LOWEST_MAX_INCOME: { $min: "$MAX_INCOME" }
    }
  },
  {
    $project: {
      _id: 0,
      LOWEST_MAX_INCOME: 1
    }
  }
]);

//34
db.emps.aggregate([
  {
    $match: { dept_id: 30 }
  },
  {
    $group: {
      _id: null,
      MIN_SALARY: { $min: "$SAL" },
      MAX_SALARY: { $max: "$SAL" },
      AVG_SALARY: { $avg: "$SAL" },
      COUNT_SALARY: { $sum: { $cond: [{ $ne: ["$SAL", null] }, 1, 0] } },
      MIN_COMM: { $min: "$COMM" },
      MAX_COMM: { $max: "$COMM" },
      AVG_COMM: { $avg: "$COMM" },
      COUNT_COMM: { $sum: { $cond: [{ $ne: ["$COMM", null] }, 1, 0] } }
    }
  },
  {
    $project: {
      _id: 0,
      MIN_SALARY: 1,
      MAX_SALARY: 1,
      AVG_SALARY: 1,
      COUNT_SALARY: 1,
      MIN_COMM: 1,
      MAX_COMM: 1,
      AVG_COMM: 1,
      COUNT_COMM: 1
    }
  }
]);

//35
db.emps.aggregate([
  {
    $group: {
      _id: "$dept_id",
      MIN_SALARY: { $min: "$SAL" },
      MAX_SALARY: { $max: "$SAL" },
      AVG_SALARY: { $avg: "$SAL" }
    }
  }
])

//36
db.emps.aggregate([
  {
    $match: {
      JOB: { $nin: ["MANAGER", "PRESIDENT"] }
    }
  },
  {
    $group: {
      _id: "$dept_id",
      MIN_SALARY: { $min: "$SAL" },
      MAX_SALARY: { $max: "$SAL" },
      AVG_SALARY: { $avg: "$SAL" },
      EMPLOYEE_COUNT: { $sum: 1 }
    }
  }
])

select * from emps join depts on dept_id=DEPTNO;

db.emps.aggregate([
{
$lookup: {
localField: "dept_id",
from: "depts",
foreignField:"DEPTNO",
as: "department"
}
}]);

db.depts.aggregate([
  {
    $lookup: {
      localField: "DEPTNO",
      from: "emps",
      foreignField: "dept_id",
      as: "mitarbeiter"
    }
  }])

db.depts.aggregate([
  {
    $lookup: {
      localField: "DEPTNO",
      from: "emps",
      foreignField: "dept_id",
      as: "mitarbeiter"
    }
  },
  {
    $unwind: "$mitarbeiter"
  }
])

db.depts.aggregate([
  {
    $lookup: {
      localField: "DEPTNO",
      from: "emps",
      foreignField: "dept_id",
      as: "mitarbeiter"
    }
  },
  {
    $unwind: "$mitarbeiter"
  },
  {
    $project: {
      _id: 0,
      DEPTNO: 1,
      DNAME: 1,
      "mitarbeiter.ENAME": 1
    }
  }
])

//37
db.emps.aggregate([
  {
    $match: { COMM: null }
  },
  {
    $group: {
      _id: "$JOB",
      AVG_SALARY: { $avg: "$SAL" }
    }
  },
  {
    $project: {
      _id: 0,
      job: "$_id",
      AVG_SALARY: 1
    }
  }
])

//37
db.emps.aggregate([
  {
    $group: {
      _id: "$dept_id",
      TOTAL_ANNUAL_PAYMENT: {
        $sum: {
          $add: [
            { $multiply: ["$SAL", 12] },
            {
              $ifNull: [
                "$COMM",
                { $multiply: [100, 12] }
              ]
            }
          ]
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      dept_id: "$_id",
      TOTAL_ANNUAL_PAYMENT: 1
    }
  }
])

//38
db.emps.aggregate([
    {
        $group: {
            _id: "$dept_id", // Gruppierung nach Abteilung
            TOTAL_ANNUAL_PAYMENT: {
                $sum: {
                    $add: [
                        { $multiply: ["$SAL", 12] }, // Grundgehalt * 12
                        { $ifNull: ["$COMM", { $multiply: [100, 12] }] } // COALESCE(COMM, 1200)
                        ]
                    }
                }
            }
        }
    ]);

//40
db.emps.aggregate([
    { $group: {
        _id: "$JOB",
        avgSal: { $avg: "$SAL" }
        }},
    { $match: { avgSal: { $gt: 1500 } } },
    { $sort: { avgSal: -1 } }
    ]);

//41
db.emps.aggregate([
    { $match: { JOB: "CLERK" } },
    { $group: { _id: "$dept_id", count: { $sum: 1 } } },
    { $match: { count: { $gte: 2 } } }
    ]);

//43
db.emps.aggregate([
    {
        $group: {
            _id: "$JOB",
            AVG_SALARY: { $avg: "$SAL" }
            }
        },
    {
        $match: {
            AVG_SALARY: { $gt: 1500 }
            }
        },
    {
        $sort: {
            _id: 1
            }
        },
    {
        $project: {
            _id: 0,
            JOB: "$_id",
            AVG_SALARY: 1
            }
        }
    ]);

//46
db.emps.aggregate([
    {
        $lookup: {
            from: "emps",
            pipeline: [
                { $match: { ENAME: "JONES" } },
                { $project: { _id: 0, SAL: 1 } }
                ],
            as: "jones_data"
            }
        },
    {
        $match: {
            $expr: {
                $gt: ["$SAL", { $arrayElemAt: ["$jones_data.SAL", 0] }]
                }
            }
        },
    {
        $project: {
            jones_data: 0
            }
        }
    ]);

//47
db.emps.aggregate([
    {
        $lookup: {
            from: "emps",
            localField: "parent_id",
            foreignField: "id",
            as: "parent_info"
            }
        },
    {
        $match: {
            $expr: {
                $gt: ["$SAL", { $arrayElemAt: ["$parent_info.SAL", 0] }]
                }
            }
        },
    {
        $project: {
            _id: 0,
            ENAME: 1,
            SAL: 1
            }
        }
    ]);

//48
db.emps.aggregate([
    {
        $lookup: {
            from: "emps",
            pipeline: [
                { $match: { JOB: "PRESIDENT" } },
                { $project: { _id: 0, SAL: 1 } }
                ],
            as: "pres_data"
            }
        },
    {
        $match: {
            $expr: {
                $lt: [
                    "$SAL",
                    { $multiply: [0.3, { $arrayElemAt: ["$pres_data.SAL", 0] }] }
                    ]
                }
            }
        },
    {
        $project: {
            pres_data: 0
            }
        }
    ]);

//49
db.depts.aggregate([
    {
        $lookup: {
            from: "emps",
            localField: "DEPTNO",
            foreignField: "dept_id",
            as: "matched_emps"
            }
        },
    {
        $match: {
            matched_emps: { $size: 0 }
            }
        },
    {
        $project: {
            matched_emps: 0
            }
        }
    ]);

//50
const jonesJob = db.emps.findOne({ ENAME: "JONES" }).JOB;

db.emps.find(
    { JOB: jonesJob },
    { ENAME: 1, _id: 0 }
    );


db.emps.aggregate([
    {
        $lookup: {
            from: "emps",
            pipeline: [
                { $match: { ENAME: "JONES" } },
                { $project: { JOB: 1, _id: 0 } }
                ],
            as: "jones"
            }
        },
    { $unwind: "$jones" },
    {
        $match: {
            $expr: { $eq: ["$JOB", "$jones.JOB"] }
            }
        },
    {
        $project: {
            _id: 0,
            ENAME: 1
            }
        }
    ])