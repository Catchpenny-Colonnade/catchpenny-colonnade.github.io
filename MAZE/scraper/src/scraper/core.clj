(ns scraper.core
  (:gen-class)
  (:require [cheshire.core :as json]
            [clj-http.client :as http]
            [clojure.string])
  (:import [com.microsoft.playwright Playwright Browser Page]
           [java.io File FileOutputStream]))

(def root-url "http://www.intotheabyss.net/")

(def room-img-route "wp-content/uploads/2012/12/Room-#.jpg")

(def rooms (range 1 46))

(defn build-paths-by-id
  "Build paths-by-id map including entries for each room."
  [rooms]
  (merge
    {:Directions "directions"
     :Prologue "prologue"}
    (into {} (map (fn [room-num]
                    [(keyword (str "Room-" room-num))
                     (str "room-" room-num)])
                  rooms))))

(def paths-by-id (build-paths-by-id rooms))

(defn generate-urls
  "Generate a list of URLs from root-url, paths-by-id, and optional rooms list."
  [root-url paths-by-id]
  (mapv (fn [[page-id path]]
          {:page-id page-id
           :url (str root-url path "/")})
        paths-by-id))

(defn image-exists?
  "Check if image file already exists."
  [page-id results-dir]
  (.exists (File. (str results-dir File/separator (name page-id) ".jpg"))))

(defn format-page-id
  "Format page-id with zero-padded room numbers."
  [page-id]
  (let [page-name (name page-id)]
    (if (clojure.string/starts-with? page-name "Room-")
      (let [room-num (subs page-name 5)
            padded (format "%02d" (Integer/parseInt room-num))]
        (str "Room-" padded))
      page-name)))

(defn download-image-from-url
  "Download an image from URL and save it with formatted page-id as filename, skipping if exists."
  [img-url page-id results-dir]
  (try
    (when (and img-url (not (clojure.string/blank? img-url)))
      (let [formatted-id (format-page-id page-id)
            extension (or (last (clojure.string/split img-url #"\.")) "jpg")
            file-path (str results-dir File/separator formatted-id "." extension)]
        (if (.exists (File. file-path))
          (str formatted-id "." extension)
          (let [response (http/get img-url {:as :byte-array})
                body (:body response)]
            (with-open [file (FileOutputStream. file-path)]
              (.write file body))
            (str formatted-id "." extension)))))
    (catch Exception e
      (throw (Exception. (str "Failed to download image: " (.getMessage e)))))))

(defn download-image-from-route
  "Download an image from a direct route and save it with formatted page-id as filename, skipping if exists."
  [base-url route page-id results-dir]
  (try
    (let [room-num (subs (name page-id) 5) ; Remove "Room-" prefix
          padded-room-num (format "%02d" (Integer/parseInt room-num)) ; Zero-pad to 2 digits
          formatted-id (format-page-id page-id)
          extension "jpg"
          file-path (str results-dir File/separator formatted-id "." extension)]
      (if (.exists (File. file-path))
        (str formatted-id "." extension)
        (let [img-url (str base-url (clojure.string/replace route "#" padded-room-num))
              response (http/get img-url {:as :byte-array})
              body (:body response)]
          (with-open [file (FileOutputStream. file-path)]
            (.write file body))
          (str formatted-id "." extension))))
    (catch Exception e
      (throw (Exception. (str "Failed to download room image: " (.getMessage e)))))))

(defn normalize-text
  "Normalize Unicode characters to ASCII equivalents."
  [text]
  (if text
    (-> text
        (clojure.string/replace "\u00a0" " ")
        (clojure.string/replace "\u2026" "...")
        (clojure.string/replace "\u201C" "\"")
        (clojure.string/replace "\u201D" "\"")
        (clojure.string/replace "\u2019" "'")
        (clojure.string/replace "\u2013" "-"))
    text))

(defn cleanup-paragraphs
  "Normalize text and split on \\n\\n, deduplicating while preserving order."
  [texts]
  (let [split-parts (vec (mapcat #(clojure.string/split % #"\n\n+") texts))
        seen (atom #{})
        result (vec (filter identity
                            (mapv (fn [part]
                                    (let [trimmed (clojure.string/trim part)]
                                      (if (clojure.string/blank? trimmed)
                                        nil
                                        (let [normalized (-> trimmed
                                                            (clojure.string/replace "\u00a0" " ")
                                                            (clojure.string/replace "\u2026" "...")
                                                            (clojure.string/replace "\u201C" "\"")
                                                            (clojure.string/replace "\u201D" "\"")
                                                            (clojure.string/replace "\u2019" "'")
                                                            (clojure.string/replace "\u2013" "-"))]
                                          (if (contains? @seen normalized)
                                            nil
                                            (do (swap! seen conj normalized)
                                                normalized))))))
                                  split-parts)))]
    result))

(defn is-room?
  "Check if page-id is a room (vs Directions/Prologue)."
  [page-id]
  (clojure.string/starts-with? (name page-id) "Room-"))

(defn extract-next-rooms
  "Extract room numbers from map area hrefs."
  [page]
  (try
    (let [area-locator (.locator page "map area[href*='/room-']")
          count (.count area-locator)
          hrefs (mapv #(.getAttribute (.nth area-locator %) "href") (range count))
          room-ids (vec (filter identity
                                (map (fn [href]
                                       (if-let [match (re-find #"/room-(\d+)/" href)]
                                         (let [room-num (Integer/parseInt (second match))]
                                           (str "Room-" (format "%02d" room-num)))
                                         nil))
                                     hrefs)))]
      room-ids)
    (catch Exception e [])))

(defn fetch-room-data
  "Fetch data for a room page using ID locators and direct image route."
  [page page-id results-dir]
  (try
    (let [room-num (subs (name page-id) 5)
          id-selector (str "#Room-" (format "%02d" (Integer/parseInt room-num)))
          img-file (download-image-from-route root-url room-img-route page-id results-dir)
          paragraphs (try
                       (let [locator (.locator page "//p[preceding-sibling::p[descendant::img] and not(preceding-sibling::blockquote) and not(preceding-sibling::p[descendant::a[contains(@href, 'amazon')]]) and not(descendant::a[contains(@href, 'amazon')]) and (following-sibling::blockquote or following-sibling::p[descendant::a[contains(@href, 'amazon')]])]")
                             texts (mapv #(.textContent (.nth locator %)) (range (.count locator)))]
                         (if (empty? texts)
                           []
                           (cleanup-paragraphs texts)))
                       (catch Exception e []))
          next-rooms (extract-next-rooms page)]
      (if (empty? paragraphs)
        {:error "No paragraphs found on page"}
        {:page-id page-id
         :paragraphs paragraphs
         :nextRooms next-rooms}))
    (catch Exception e
      {:error (.getMessage e)})))

(defn fetch-prologue-directions-data
  "Fetch data for Prologue/Directions pages with different paragraph logic."
  [page page-id results-dir]
  (try
    (let [img-locator (try
                        (.locator page ".entry-content > p img")
                        (catch Exception e nil))
          img-src (if (and img-locator (> (.count img-locator) 0))
                    (try
                      (.getAttribute img-locator "src")
                      (catch Exception e nil))
                    nil)
          img-file (when img-src (download-image-from-url img-src page-id results-dir))
          ; Get paragraphs: all p tags after p[img] and before amazon link or blockquote
          paragraphs (try
                       (let [locator (.locator page "//p[preceding-sibling::p[descendant::img] and not(preceding-sibling::blockquote) and not(preceding-sibling::p[descendant::a[contains(@href, 'amazon')]]) and not(descendant::a[contains(@href, 'amazon')]) and (following-sibling::blockquote or following-sibling::p[descendant::a[contains(@href, 'amazon')]])]")
                             texts (mapv #(.textContent (.nth locator %)) (range (.count locator)))]
                         (if (empty? texts)
                           []
                           (cleanup-paragraphs texts)))
                       (catch Exception e []))
          ; For Directions, next is Prologue; for Prologue, next is Room-01
          next-rooms (cond
                       (= (name page-id) "Directions") ["Prologue"]
                       (= (name page-id) "Prologue") ["Room-01"]
                       :else (extract-next-rooms page))]
      (if (empty? paragraphs)
        {:error "No paragraphs found on page"}
        {:page-id page-id
         :paragraphs paragraphs
         :nextRooms next-rooms}))
    (catch Exception e
      {:error (.getMessage e)})))

(defn fetch-page-data
  "Fetch data from a page using appropriate handler based on page type."
  [page page-id url results-dir]
  (try
    (.navigate page url)
    (Thread/sleep 2000) ; Wait for page to load
    (if (is-room? page-id)
      (fetch-room-data page page-id results-dir)
      (fetch-prologue-directions-data page page-id results-dir))
    (catch Exception e
      {:error (.getMessage e)})))

(defn ensure-results-dir
  "Create results directory if it doesn't exist."
  [results-dir]
  (.mkdirs (File. results-dir))
  results-dir)

(defn results-to-sorted-map
  "Convert results array to sorted-map with formatted page-ids and structured values."
  [results]
  (into (sorted-map)
        (map (fn [result]
               [(format-page-id (:page-id result))
                {:paragraphs (:paragraphs result)
                 :nextRooms (:nextRooms result [])}])
             results)))

(defn validate-results
  "Validate results.json: check for empty paragraphs and missing images."
  [results results-dir]
  (let [has-empty-paragraphs? (some (fn [[page-id value]]
                                      (empty? (:paragraphs value)))
                                    results)
        has-missing-images? (some (fn [[page-id value]]
                                    (not (.exists (File. (str results-dir File/separator page-id ".jpg")))))
                                  results)]
    {:valid? (and (not has-empty-paragraphs?) (not has-missing-images?))
     :empty-paragraphs? has-empty-paragraphs?
     :missing-images? has-missing-images?}))

(defn check-and-load-results
  "Check, validate, and load results.json. Delete if invalid. Return [results valid?]"
  [results-dir]
  (let [json-file (str results-dir File/separator "results.json")
        existing (try
                   (if (.exists (File. json-file))
                     (let [parsed (json/parse-string (slurp json-file) true)]
                       (if (map? parsed) parsed {}))
                     {})
                   (catch Exception e {}))]
    (if (empty? existing)
      [{} true]
      (let [validation (validate-results existing results-dir)]
        (if (:valid? validation)
          [existing true]
          (do
            (try (.delete (File. json-file)) (catch Exception e nil))
            (println (str "Deleted invalid results.json: " validation))
            [{} false]))))))

(defn check-and-clean-errors
  "Check errors.json and clean it up. Always delete after review."
  [results-dir]
  (let [errors-file (str results-dir File/separator "errors.json")]
    (try
      (when (.exists (File. errors-file))
        (.delete (File. errors-file)))
      (catch Exception e nil))))

(defn get-completed-page-ids
  "Extract set of completed page-ids from valid results."
  [results]
  (set (keys results)))

(defn scrape-urls
  "Scrape data from a series of URLs, download images, and save to results folder.
   Only scrapes pages not already in results.json. Overwrites results.json after each run.
   Cleans up errors.json."
  [urls results-dir]
  (ensure-results-dir results-dir)
  (let [json-file (str results-dir File/separator "results.json")
        errors-file (str results-dir File/separator "errors.json")
        [valid-results results-valid?] (check-and-load-results results-dir)
        _ (check-and-clean-errors results-dir)
        completed-page-ids (get-completed-page-ids valid-results)
        urls-to-scrape (vec (filter (fn [{:keys [page-id]}]
                                      (not (completed-page-ids page-id)))
                                    urls))]
    
    (if (empty? urls-to-scrape)
      ; All pages already scraped
      (do
        (println (str "All " (count urls) " pages already scraped."))
        (println (str "  - " (count valid-results) " successful results"))
        valid-results)
      
      ; Scrape new pages
      (let [playwright (Playwright/create)
            browser (.launch (.chromium playwright))
            page (.newPage browser)
            new-results (mapv (fn [{:keys [page-id url]}]
                                (fetch-page-data page page-id url results-dir))
                              urls-to-scrape)
            new-successful (filter #(contains? % :paragraphs) new-results)
            new-errors (filter #(contains? % :error) new-results)
            ; Merge new successful with existing valid results into sorted-map
            all-entries (concat (seq valid-results)
                               (map (fn [result]
                                      [(format-page-id (:page-id result))
                                       {:paragraphs (:paragraphs result)
                                        :nextRooms (:nextRooms result [])}])
                                    new-successful))
            all-successful (into (sorted-map) all-entries)]
        
        (try
          ; Always overwrite results.json with merged data
          (spit json-file (json/generate-string all-successful {:pretty true}))
          ; Only write errors.json if there are errors
          (when (seq new-errors)
            (spit errors-file (json/generate-string new-errors {:pretty true})))
          (println (str "Scraping complete. Results saved to " results-dir))
          (println (str "  - Scraped " (count urls-to-scrape) " new pages"))
          (println (str "  - Successful: " (count all-successful) " total"))
          (when (seq new-errors)
            (println (str "  - Errors: " (count new-errors) " (see errors.json)")))
          all-successful
          (finally
            (.close page)
            (.close browser)
            (.close playwright)))))))

(defn -main
  "Main entry point for the web scraper.
   Usage: lein run [--output <results-folder>]
          or
          lein run <url1> <url2> ... [--output <results-folder>]"
  [& args]
  (let [has-output-flag (some #{"--output"} args)
        results-dir (if has-output-flag
                      (second (drop-while #(not= % "--output") args))
                      "results")
        url-args (vec (filter #(and (not= % "--output") 
                                     (not (= % results-dir)))
                              args))]
    (if (empty? url-args)
      ; No URLs provided, use generate-urls with paths-by-id
      (let [urls (generate-urls root-url paths-by-id)]
        (scrape-urls urls results-dir)
        (println (str "Successfully scraped " (count urls) " URLs")))
      
      ; URLs provided via command line
      (let [urls (vec url-args)]
        (scrape-urls urls results-dir)
        (println (str "Successfully scraped " (count urls) " URLs"))))))
