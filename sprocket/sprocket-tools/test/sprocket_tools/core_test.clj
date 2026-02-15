(ns sprocket-tools.core-test
  (:require
   [clojure.data.xml :as xml]
   [clojure.java.io :as io]
   [clojure.pprint :as pp]
   [clojure.string :as str]
   [clojure.test :refer :all]
   [sprocket-tools.core :refer :all]))

(defmulti process-path-step 
  (fn [_ _ [tag]]
    (if (= tag "H")
      :H
      (if (= tag "V")
        :V
        (if (= tag (str/upper-case tag))
          :upper-case
          :lower-case)))))

(defmethod process-path-step :V [_ row [tag dist]]
  (let [{:keys [y]} step
        y (* y row)]
    (vector tag (round (- dist y)))))

(defmethod process-path-step :H [column _ [tag dist]]
  (let [{:keys [x]} step
        x (* x column)]
    (vector tag (round (- dist x)))))

(defmethod process-path-step :upper-case [column row [tag & numbers]]
  (let [{:keys [x y]} step
        x (* x column)
        y (* y row)
        pairs (partition 2 numbers)]
    (into [tag] (flatten (map (fn [[x1 y1]] (mapv #(round (- %1 %2)) [x1 y1] [x y])) pairs)))))

(defmethod process-path-step :default [_ _ path-step] path-step)

(defmulti process-item #(:tag %3))

(defmethod process-item :g [column row {:keys [attrs content]}]
  (let [{:keys [id]} attrs]
    {:id id
     :paths (->> content
                 (filter #(= :path (:tag %)))
                 (mapv (fn [{:keys [attrs]}]
                        (let [{:keys [class d]} attrs
                              parsed-path (parse-path d)
                              parsed-path (mapv #(process-path-step column row %) parsed-path)
                              parsed-path (parsed-path-to-str parsed-path)]
                          {:color class
                           :path parsed-path}))))}))

(defmethod process-item :path [column row {:keys [attrs]}]
  (let [{:keys [id class d]} attrs
        parsed-path (parse-path d)
        parsed-path (mapv #(process-path-step column row %) parsed-path)
        parsed-path (parsed-path-to-str parsed-path)]
    {:id id
     :paths [{:color class
              :path parsed-path}]}))

(deftest parse-test
  (testing "test parsing svg"
    (let [grid (->> "resources/cat-emoticons.svg" 
                    (slurp)
                    (zip-str)
                    (first)
                    (:content)
                    (filter #(= :g (:tag %)))
                    (reduce (fn [acc {:keys [attrs content]}]
                              (let [{:keys [id]} attrs
                                    [column row] (map #(Integer/parseInt %) (str/split id #"x"))
                                    items (filter #(or (= :g (:tag %)) (= :path (:tag %))) content)
                                    items (mapv #(process-item column row %) items)]
                                (assoc acc id items))) {}))
          grid (flatten (vals grid))
          grid (sort-by :id grid)
          defs (xml/element
                :defs
                {}
                (mapv
                 (fn [{:keys [id paths]}]
                   (xml/element
                    :g
                    {:id id}
                    (mapv
                     (fn [{:keys [color path]}]
                       (xml/element
                        :path
                        {:class color
                         :d path}
                        []))
                     paths)))
                 grid))
          svg (xml/element :svg {} defs)
          out-file (io/writer "resources/defs.svg")]
      (pp/pprint defs)
      (xml/emit svg out-file)
      (.close out-file))))

(def test-path "M1587.8,1539.5v-19.2c-13.5-0.6-26.6-4.2-34.3-8.7l6.1-23.6c8.5,4.6,20.4,8.9,33.5,8.9
                     c11.5,0,19.4-4.4,19.4-12.5c0-7.7-6.5-12.5-21.4-17.6c-21.6-7.3-36.3-17.4-36.3-36.9c0-17.8,12.5-31.7,34.1-35.9v-19.2h19.8v17.8
                     c13.5,0.6,22.6,3.4,29.3,6.7l-5.9,22.8c-5.2-2.2-14.5-6.9-29.1-6.9c-13.1,0-17.4,5.7-17.4,11.3c0,6.7,7.1,10.9,24.2,17.4
                     c24,8.5,33.7,19.6,33.7,37.7c0,18-12.7,33.3-35.9,37.3v20.6H1587.8z")

(comment
 (deftest path-parse-test
  (testing "testing path parse on test path"
    (let [trimmed-test-path (str/replace test-path #"\s" "")
          parsed-path (parse-path test-path)
          parsed-path-string (parsed-path-to-str parsed-path)]
      (pp/pprint parsed-path)
      (is (= trimmed-test-path parsed-path-string))))))

(comment
  (deftest test-path-regex
    (testing "testing path regex"
      (pp/pprint
       (map
        #(vector (str %) (get-char-type %))
        test-path)))))