(ns sudoku-research.db.helpers
  (:require [clojure.java.io :as io]
            [clojure.set]
            [clojure.string :as str]
            [next.jdbc :as jdbc]
            [next.jdbc.result-set :as rs]))

;; ============================================================================
;; SQL METADATA LOADING - Parse and cache SQL queries from resource file
;; ============================================================================

(defn- parse-label
  "Parse label and optional argument list from comment.
   Format: -- query-label or -- query-label: arg1, arg2, arg3"
  [label-text]
  (let [[label args-str] (str/split label-text #":" 2)
        label-kw (keyword (str/trim label))
        args (if args-str
               (mapv (fn [arg] (keyword (str/trim arg)))
                     (str/split args-str #","))
               [])]
    {:label label-kw :args args}))

(defn- load-queries
  "Load labeled SQL statements from resources/sql/sudoku_research_queries.sql.
   Labels are declared using comment lines in the form: -- query-label or -- query-label: arg1, arg2, arg3"
  []
  (let [resource "sql/sudoku_research_queries.sql"]
    (if-let [query-url (io/resource resource)]
      (let [content (slurp query-url)
            lines (str/split-lines content)
            grouped (reduce (fn [acc line]
                              (if (str/starts-with? (str/trim line) "--")
                                (let [{:keys [label args]} (parse-label (-> line str/trim (subs 2) str/trim))]
                                  (conj acc {:label label :args args :query ""}))
                                (if (empty? acc)
                                  acc
                                  (let [last-idx (dec (count acc))]
                                    (update-in acc [last-idx :query] #(str % "\n" line))))))
                            []
                            lines)]
        (into {}
              (map (fn [{:keys [label args query]}]
                     [label {:sql (str/trim query) :args args}])
                   grouped)))
      (do
        (println "[WARN] SQL resource not found:" resource)
        {}))))

(defonce queries (delay (load-queries)))

(defn query
  "Return SQL text for the given keyword label. Throws if label is missing."
  [label]
  (if-let [entry (get @queries label)]
    (:sql entry)
    (throw (ex-info (str "Missing SQL query label: " label)
                    {:label label}))))

(defn query-args
  "Return argument list (as keywords) for the given keyword label. 
   Returns empty vector if label is missing or has no args."
  [label]
  (if-let [entry (get @queries label)]
    (:args entry)
    []))

;; ============================================================================
;; JDBC EXECUTION DISPATCHER - Multimethod for mode selection
;; ============================================================================

(defmulti execute-jdbc-call
  "Dispatch JDBC calls based on mode (:one for single row, :many for multiple)."
  (fn [mode _db _sql-params _opts]
    mode))

(defmethod execute-jdbc-call :one
  [_ db sql-params opts]
  (jdbc/execute-one! db sql-params opts))

(defmethod execute-jdbc-call :many
  [_ db sql-params opts]
  (jdbc/execute! db sql-params opts))

;; ============================================================================
;; PARAMETER VALIDATION AND GENERIC EXECUTION
;; ============================================================================

(defn build-param-vector
  "Build ordered parameter vector from a map using argument names from SQL metadata.
   Validates that all required parameters are provided."
  [label param-map]
  (let [arg-names (query-args label)
        provided-keys (set (keys param-map))
        required-keys (set arg-names)
        missing (clojure.set/difference required-keys provided-keys)
        extra (clojure.set/difference provided-keys required-keys)]
    (when (or (not-empty missing) (not-empty extra))
      (throw (ex-info (str "Parameter mismatch for " label)
                      {:label label
                       :required required-keys
                       :provided provided-keys
                       :missing missing
                       :extra extra})))
    (mapv (partial get param-map) arg-names)))

(defn execute-safe
  "Generic JDBC execution helper with mode selection via multimethod.
   
   Parameters:
   - db: database connection
   - label: query label for metadata lookup
   - param-map: parameters keyed by argument names
   - mode: :one for execute-one! (single row), :many for execute! (multiple rows)
   - opts: optional map of additional options (e.g., {:return-keys true})
   
   Always uses as-unqualified-maps builder-fn."
  [db label param-map mode & [opts]]
  (let [params (build-param-vector label param-map)]  ;; Parameter validation errors surface directly
    (try
      (let [jdbc-opts (merge {:builder-fn rs/as-unqualified-maps} opts)
            sql-params (into [(query label)] params)]
        (execute-jdbc-call mode db sql-params jdbc-opts))
      (catch Exception e
        (throw (ex-info (str "Error executing " (name label))
                        {:label label}
                        e))))))
