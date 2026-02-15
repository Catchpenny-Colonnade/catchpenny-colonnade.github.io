(ns sprocket-tools.core
  (:require
   [clojure.data.xml :as xml]
   [clojure.pprint :as pp]
   [clojure.string :as str]
   [clojure.zip :as zip]))

(def colors
  {:pale "#ACF"
   :ears "#67a3ff"
   :shade "#35A"
   :dark "#021039"
   :white "#FFF"
   :tongue-red "#C22"
   :heart-red "#F44"
   :water-blue "#0DE"
   :green "#6A4"})

(def step
  {:x 551.8
   :y 551.9})

(comment "path-tags" '("C" "H" "L" "M" "S" "V"))

(defn round [num]
  (/ (Math/round (* (double num) 10.0)) 10.0))

(defn zip-str [s]
  (zip/xml-zip
   (xml/parse
    (java.io.ByteArrayInputStream.
     (.getBytes s)))))

(def path-regex
  {:letter #"[A-Za-z]"
   :numeric #"[.0-9]"
   :negative #"[-]"
   :comma #"[,]"
   :space #"\s"})

(defn get-char-type [myChar]
  (loop [pairs path-regex]
    (when-let [[label regex] (first pairs)]
      (if (re-matches regex (str myChar))
        label
        (recur (rest pairs))))))

(defn parse-and-append-str-if-possible [step-list step-str]
  (if (empty? step-str)
    step-list
    (conj step-list (Double/parseDouble step-str))))

(defmulti append-char (fn [myChar _] (get-char-type myChar)))

(defmethod append-char :letter [myChar {:keys [out-list step-list step-str] :as acc}]
  (assoc acc :out-list (conj out-list (parse-and-append-str-if-possible step-list step-str)) :step-list [(str myChar)] :step-str ""))

(defmethod append-char :numeric [myChar {:keys [step-str] :as acc}]
  (assoc acc :step-str (str step-str myChar)))

(defmethod append-char :negative [_ {:keys [step-list step-str] :as acc}]
  (assoc acc :step-list (parse-and-append-str-if-possible step-list step-str) :step-str "-"))

(defmethod append-char :comma [_ {:keys [step-list step-str] :as acc}]
  (assoc acc :step-list (parse-and-append-str-if-possible step-list step-str) :step-str ""))

(defmethod append-char :default [_ acc] acc)

(defn parse-path [path]
  (let [char-list (map str (str/trim path))
        {:keys [out-list step-list]} (reduce
                                      #(append-char %2 %1)
                                      {:out-list [] :step-list [(first char-list)] :step-str ""}
                                      (rest char-list))]
    (conj out-list step-list)))

(defn parsed-path-to-str [parsed-path]
  (as-> parsed-path $
    (map
     (fn [path-step]
       (str (first path-step) (str/join "," (rest path-step))))
     $)
    (str/join "" $)
    (str/replace $ #",-" "-")
    (str/replace $ #"\.0-" "-")
    (str/replace $ #"\.0," ",")))
