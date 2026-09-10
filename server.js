const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));


/* =========================
   MYSQL DATABASE
========================= */

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "reva",
    database: "puzzle_world"
});

/* =========================
   DATABASE CONNECTION
========================= */

db.connect((err) => {

    if (err) {

        console.log("❌ MySQL connection failed");
        console.log(err.message);

        return;
    }

    console.log("✅ MySQL Connected Successfully");

});


/* =========================
   CHECK SRN
   BEFORE QUIZ STARTS
========================= */

app.get("/api/students/check/:srn", (req, res) => {

    const srn = req.params.srn.trim();


    if (srn === "") {

        return res.status(400).json({

            message: "SRN is required"

        });

    }


    const sql = `
        SELECT id
        FROM students
        WHERE srn = ?
        LIMIT 1
    `;


    db.query(sql, [srn], (err, results) => {

        if (err) {

            console.log(
                "❌ Database error:",
                err.message
            );

            return res.status(500).json({

                message: "Failed to check SRN",

                error: err.message

            });

        }


        /* =========================
           SRN ALREADY EXISTS
        ========================= */

        if (results.length > 0) {

            console.log(
                "❌ SRN already attempted:",
                srn
            );

            return res.json({

                alreadyAttempted: true,

                message:
                    "Attempt already taken"

            });

        }


        /* =========================
           NEW SRN
        ========================= */

        console.log(
            "✅ New SRN:",
            srn
        );

        res.json({

            alreadyAttempted: false,

            message:
                "SRN is available"

        });

    });

});


/* =========================
   SAVE STUDENT
   ONE SRN = ONE ATTEMPT
========================= */

app.post("/api/students", (req, res) => {

    console.log(
        "POST /api/students received"
    );

    console.log(req.body);


    const {
        studentName,
        srn,
        score
    } = req.body;


    /* =========================
       CHECK REQUIRED DATA
    ========================= */

    if (
        !studentName ||
        !srn ||
        score === undefined
    ) {

        return res.status(400).json({

            message:
                "Student name, SRN and score are required"

        });

    }


    /* =========================
       CHECK SRN AGAIN
       BEFORE INSERT
    ========================= */

    const checkSql = `
        SELECT id
        FROM students
        WHERE srn = ?
        LIMIT 1
    `;


    db.query(
        checkSql,
        [srn],
        (checkErr, results) => {

            if (checkErr) {

                console.log(
                    "❌ Database error:",
                    checkErr.message
                );

                return res.status(500).json({

                    message:
                        "Failed to check SRN",

                    error:
                        checkErr.message

                });

            }


            /* =========================
               SRN ALREADY EXISTS
            ========================= */

            if (results.length > 0) {

                console.log(
                    "❌ Duplicate attempt blocked:",
                    srn
                );

                return res.status(409).json({

                    message:
                        "Attempt already taken",

                    error:
                        "This SRN has already completed the quiz."

                });

            }


            /* =========================
               NEW STUDENT
               INSERT RECORD
            ========================= */

            const insertSql = `
                INSERT INTO students
                (student_name, srn, score)
                VALUES (?, ?, ?)
            `;


            db.query(
                insertSql,
                [
                    studentName,
                    srn,
                    score
                ],
                (err, result) => {

                    if (err) {

                        console.log(
                            "❌ Database error:",
                            err.message
                        );


                        /*
                           If another request inserted
                           the same SRN at the same time,
                           UNIQUE constraint will catch it.
                        */

                        if (
                            err.code ===
                            "ER_DUP_ENTRY"
                        ) {

                            return res.status(409).json({

                                message:
                                    "Attempt already taken",

                                error:
                                    "This SRN has already completed the quiz."

                            });

                        }


                        return res.status(500).json({

                            message:
                                "Failed to save student",

                            error:
                                err.message

                        });

                    }


                    console.log(
                        "✅ Student saved successfully"
                    );


                    res.json({

                        message:
                            "Student saved successfully",

                        id:
                            result.insertId

                    });

                }
            );

        }
    );

});


/* =========================
   GET ALL STUDENTS
   LEADERBOARD
========================= */

app.get("/api/students", (req, res) => {

    console.log(
        "GET /api/students received"
    );


    const sql = `
        SELECT
            student_name,
            srn,
            score,
            attended_at
        FROM students
        ORDER BY
            score DESC,
            attended_at ASC
    `;


    db.query(
        sql,
        (err, results) => {

            if (err) {

                console.log(
                    "❌ Database error:",
                    err.message
                );

                return res.status(500).json({

                    message:
                        "Failed to get students",

                    error:
                        err.message

                });

            }


            console.log(
                "✅ Students fetched:",
                results
            );


            res.json(results);

        }
    );

});


/* =========================
   GET TOTAL STUDENTS
========================= */

app.get("/api/students/count", (req, res) => {

    const sql = `
        SELECT COUNT(*) AS total
        FROM students
    `;


    db.query(
        sql,
        (err, results) => {

            if (err) {

                console.log(
                    "❌ Database error:",
                    err.message
                );

                return res.status(500).json({

                    message:
                        "Failed to get student count",

                    error:
                        err.message

                });

            }


            res.json({

                total:
                    results[0].total

            });

        }
    );

});


/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});