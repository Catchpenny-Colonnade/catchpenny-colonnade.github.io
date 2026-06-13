(defproject sudoku-research "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "EPL-2.0 OR GPL-2.0-or-later WITH Classpath-exception-2.0"
            :url "https://www.eclipse.org/legal/epl-2.0/"}
  :dependencies [[org.clojure/clojure "1.11.1"]
                 [com.github.seancorfield/next.jdbc "1.2.753"]
                 [org.postgresql/postgresql "42.6.0"]
                 [org.clojure/math.combinatorics "0.1.6"]
                 [org.clojure/data.json "2.4.0"]
                 [org.clojure/tools.cli "1.0.219"]]
  :plugins [[lein-cloverage "1.2.4"]]
  :main ^:skip-aot sudoku-research.core
  :target-path "target/%s"
  :test-paths ["test" "integration-test"]
  :test-selectors {:default (complement :integration)
                   :unit :unit
                   :integration :integration}
  :profiles {:uberjar {:aot :all
                       :jvm-opts ["-Dclojure.compiler.direct-linking=true"]}})