/**
 * @fileoverview Modello Mongoose per le recensioni di film da Rotten Tomatoes
 * @description Implementa il modello Review secondo una organizzazione MVC.
 *
 * Struttura dati basata su: rotten_tomatoes_reviews.csv
 * Colonne: ['rotten_tomatoes_link', 'movie_title', 'critic_name', 'top_critic',
 *          'publisher_name', 'review_type', 'review_score', 'review_date', 'review_content']
 */

const mongoose = require("mongoose");
const { VALIDATION_LIMITS, ENUMS } = require("../config/constants");

/**
 * @typedef {Object} ReviewDocument
 * @property {string} movie_title - Titolo del film recensito (obbligatorio, indicizzato)
 * @property {string} [review_type] - Tipo di recensione (Fresh/Rotten/Certified Fresh/Spilled)
 * @property {string} [publisher_name] - Nome dell'editore che ha pubblicato la recensione
 * @property {number} [id_movie] - ID numerico del film (opzionale, per collegamento con altri dataset)
 * @property {string} [rotten_tomatoes_link] - Link alla pagina Rotten Tomatoes
 * @property {string} [critic_name] - Nome del critico che ha scritto la recensione
 * @property {number} [review_score] - Punteggio numerico della recensione (> 0)
 * @property {string} [review_date] - Data della recensione in formato stringa
 * @property {boolean} [top_critic] - Indica se il critico è classificato come "top critic"
 * @property {string} [review_content] - Contenuto testuale della recensione (max 600 caratteri)
 */

/**
 * Schema Mongoose per le recensioni di film.
 * Definisce la struttura dei documenti nella collection 'reviews'.
 *
 * Nota: Deve essere implementato in un MODEL prima di essere usato per creare istanze.
 *
 * @type {mongoose.Schema<ReviewDocument>}
 */
const reviewSchema = new mongoose.Schema(
  {
    /**
     * Titolo del film recensito
     * @type {String}
     * @required
     * @index
     */
    movie_title: {
      type: String,
      required: [true, "Movie title is required"],
      trim: true,
      index: true,
    },

    /**
     * Tipo di recensione secondo Rotten Tomatoes
     * @type {String}
     * @enum {string[]} ['Fresh', 'Rotten', 'Certified Fresh', 'Spilled']
     */
    review_type: {
      type: String,
      enum: {
        values: ENUMS.REVIEW_TYPES,
        messages: `Review type must be one of: ${ENUMS.REVIEW_TYPES.join(", ")}`,
      },
      index: true,
    },

    /**
     * Nome dell'editore/pubblicazione che ha pubblicato la recensione
     * @type {String}
     */
    publisher_name: {
      type: String,
      trim: true,
    },

    /**
     * ID numerico del film (per collegamento con altri dataset)
     * Opzionale, ma se presente deve essere un intero positivo
     * @type {Number}
     */
    id_movie: {
      type: Number,
      required: false,
      index: true,
      validate: {
        validator: function (value) {
          // Accetta null, undefined o numeri interi positivi
          return (
            value === null ||
            value === undefined ||
            (Number.isInteger(value) && value > 0)
          );
        },
        message: "Movie ID must be a positive integer",
      },
    },

    /**
     * URL della pagina Rotten Tomatoes (da completare con https://www.rottentomatoes.com/)
     * @type {String}
     */
    rotten_tomatoes_link: {
      type: String,
      trim: true,
    },

    /**
     * Nome del critico che ha scritto la recensione
     * @type {String}
     */
    critic_name: {
      type: String,
      trim: true,
    },

    /**
     * Punteggio numerico della recensione
     * Deve essere un numero positivo
     * @type {Number}
     */
    review_score: {
      type: Number,
      min: [
        VALIDATION_LIMITS.REVIEW_MIN_SCORE,
        `Score must be at least ${VALIDATION_LIMITS.REVIEW_MIN_SCORE}`,
      ],
      max: [
        VALIDATION_LIMITS.REVIEW_MAX_SCORE,
        `Score cannot exceed ${VALIDATION_LIMITS.REVIEW_MAX_SCORE}`,
      ],
    },

    /**
     * Data della recensione in formato stringa
     * @type {String}
     */
    review_date: {
      type: String,
      trim: true,
    },

    /**
     * Indica se il critico è classificato come "top critic" da Rotten Tomatoes
     * @type {Boolean}
     */
    top_critic: {
      type: Boolean,
      default: false,
    },

    /**
     * Contenuto testuale completo della recensione
     * @type {String}
     */
    review_content: {
      type: String,
      trim: true,
      maxlength: [
        VALIDATION_LIMITS.REVIEW_CONTENT_MAX_LENGTH,
        `Review content cannot exceed ${VALIDATION_LIMITS.REVIEW_CONTENT_MAX_LENGTH} characters`,
      ],
    },
  },
  {
    /**
     * Opzioni dello schema
     */
    collection: "reviews", // Nome esplicito della collection
    timestamps: false,
    versionKey: false,
  },
);

/**
 * Indice composto per query su film specifici ordinate per data
 * Utile per: getReviewsByMovieId con ordinamento temporale
 */
reviewSchema.index({ id_movie: 1, review_date: -1 });

/**
 * Indice composto per ricerche per titolo e tipo di recensione
 * Utile per: filtrare recensioni per film e tipo specifico
 */
reviewSchema.index({ movie_title: 1, review_type: 1 });

/**
 * Indice per ricerche per nome del critico
 * Utile per: trovare tutte le recensioni di un critico specifico
 */
reviewSchema.index({ critic_name: 1 });

/**
 * Recupera le recensioni di un film specifico con paginazione e ordinamento.
 *
 * @static
 * @async
 * @param {number} movieId - ID del film
 * @param {Object} [pagination={}] - Opzioni di paginazione e ordinamento
 * @param {number} [pagination.page=1] - Numero della pagina (inizia da 1)
 * @param {number} [pagination.limit=20] - Numero di risultati per pagina
 * @param {string} [pagination.sortBy='review_date'] - Campo per l'ordinamento
 * @param {number} [pagination.sortOrder=-1] - Ordine: -1 DESC, 1 ASC
 * @returns {Promise<Object>} Oggetto con reviews, totalCount, currentPage, totalPages
 * @throws {Error} Se si verifica un errore durante la query
 */
reviewSchema.statics.getReviewsByMovieId = async function (
  movieId,
  pagination = {},
) {
  try {
    // destrutturazione dell'oggetto pagination con valori di default
    const {
      page = 1,
      limit = VALIDATION_LIMITS.DEFAULT_PAGE_SIZE,
      sortBy = "review_date",
      sortOrder = -1, // -1 = DESC, 1 = ASC
    } = pagination;

    // validazione parametri
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(
      VALIDATION_LIMITS.MAX_PAGE_SIZE,
      Math.max(1, parseInt(limit)),
    );
    const skip = (pageNum - 1) * limitNum;

    // costruzione oggetto di ordinamento
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    // query parallele -> ottimizzare le prestazioni
    const [reviews, totCount] = await Promise.all([
      this.find({ id_movie: movieId })
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(), // oggetti js puri (miglior performance)
      this.countDocuments({ id_movie: movieId }), // quante entries trovate
    ]);

    return {
      reviews,
      totCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totCount / limitNum),
      hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
      hasPrevPage: pageNum > 1,
    };
  } catch (error) {
    console.error("Error in getReviewsByMovieId:", error);
    throw new Error(
      `Error retrieving reviews for movie ${movieId}: ${error.message}`,
    );
  }
};

/**
 * Recupera statistiche aggregate per un film specifico.
 * Calcola media dei punteggi, distribuzione per tipo, conteggi, ecc.
 *
 * @static
 * @async
 * @param {number} movieId - ID del film
 * @returns {Promise<Object|null>} Oggetto con statistiche aggregate o null se nessuna recensione trovata
 * @throws {Error} Se si verifica un errore durante l'aggregazione
 */
reviewSchema.statics.getMovieReviewStats = async function (movieId) {
  try {
    const pipeline = [
      // filtraggio -> solo le recensioni utili
      {
        $match: {
          id_movie: movieId,
          review_score: {
            $exists: true,
            $type: "number",
            $gte: VALIDATION_LIMITS.REVIEW_MIN_SCORE,
            $lte: VALIDATION_LIMITS.REVIEW_MAX_SCORE,
          },
          review_type: {
            $in: ENUMS.REVIEW_TYPES,
          },
        },
      },
      // aggregazione
      {
        $group: {
          _id: "$id_movie",
          totalReviews: { $sum: 1 },
          averageScore: { $avg: "$review_score" },
          maxScore: { $max: "$review_score" },
          minScore: { $min: "$review_score" },

          // Classificazione Rotten Tomatoes:
          // - Fresh include: "Fresh" + "Certified Fresh"
          freshReviews: {
            $sum: {
              $cond: [
                { $in: ["$review_type", ["Fresh", "Certified Fresh"]] },
                1,
                0,
              ],
            },
          },

          // - Rotten include: "Rotten" + "Spilled"
          rottenReviews: {
            $sum: {
              $cond: [{ $in: ["$review_type", ["Rotten", "Spilled"]] }, 1, 0],
            },
          },

          // Classificazione per punteggio
          positiveScoreReviews: {
            $sum: {
              $cond: [{ $gte: ["$review_score", 6] }, 1, 0],
            },
          },

          negativeScoreReviews: {
            $sum: {
              $cond: [{ $lt: ["$review_score", 6] }, 1, 0],
            },
          },

          // Critics
          topCriticsCount: {
            $sum: { $cond: [{ $eq: ["$top_critic", true] }, 1, 0] },
          },

          // Distribuzione dettagliata -> array di tutti i tipi
          reviewTypeDistribution: {
            $push: "$review_type",
          },
        },
      },
      // Calcolo percentuali e output finale
      {
        $project: {
          _id: 0,
          movieId: "$_id",

          // conteggi assoluti
          totalReviews: 1,
          freshCount: "$freshReviews",
          rottenCount: "$rottenReviews",
          positiveScoreCount: "$positiveScoreReviews",
          negativeScoreCount: "$negativeScoreReviews",
          topCriticsCount: 1,

          // stats punteggi
          averageScore: { $round: ["$averageScore", 2] },
          maxScore: 1,
          minScore: 1,

          // percentuali
          freshPercentage: {
            $cond: [
              { $gt: ["$totalReviews", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$freshReviews", "$totalReviews"] },
                      100,
                    ],
                  },
                  1,
                ],
              },
              0,
            ],
          },

          rottenPercentage: {
            $cond: [
              { $gt: ["$totalReviews", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$rottenReviews", "$totalReviews"] },
                      100,
                    ],
                  },
                  1,
                ],
              },
              0,
            ],
          },

          // percentuali per punteggio
          positiveScorePercentage: {
            $cond: [
              { $gt: ["$totalReviews", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$positiveScoreReviews", "$totalReviews"] },
                      100,
                    ],
                  },
                  1,
                ],
              },
              0,
            ],
          },

          negativeScorePercentage: {
            $cond: [
              { $gt: ["$totalReviews", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$negativeScoreReviews", "$totalReviews"] },
                      100,
                    ],
                  },
                  1,
                ],
              },
              0,
            ],
          },

          // top critics
          topCriticsPercentage: {
            $cond: [
              { $gt: ["$totalReviews", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$topCriticsCount", "$totalReviews"] },
                      100,
                    ],
                  },
                  1,
                ],
              },
              0,
            ],
          },

          // distribuzione dettagliata per tipo
          reviewTypeCounts: {
            $let: {
              vars: {
                types: "$reviewTypeDistribution",
              },
              in: {
                Fresh: {
                  $size: {
                    $filter: {
                      input: "$types",
                      cond: { $eq: ["$this", "Fresh"] },
                    },
                  },
                },
                Rotten: {
                  $size: {
                    $filter: {
                      input: "$types",
                      cond: { $eq: ["$this", "Rotten"] },
                    },
                  },
                },
                "Certified Fresh": {
                  $size: {
                    $filter: {
                      input: "$types",
                      cond: { $eq: ["$this", "Certified Fresh"] },
                    },
                  },
                },
                Spilled: {
                  $size: {
                    $filter: {
                      input: "$types",
                      cond: { $eq: ["$this", "Spilled"] },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ];

    const result = await this.aggregate(pipeline);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error in getMovieReviewStats:", error);
    throw new Error(
      `Error calculating statistics for movie ${movieId}: ${error.message}`,
    );
  }
};

// CREAZIONE DEL MODELLO

/**
 * Modello Mongoose per le recensioni.
 * Una volta creato il modello, si può usare per find, create, update, delete
 *
 * @type {mongoose.Model<ReviewDocument>}
 */
const reviewModel = mongoose.model("Reviews", reviewSchema);

module.exports = reviewModel;
