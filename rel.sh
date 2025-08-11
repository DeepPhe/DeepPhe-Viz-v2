export NODE_OPTIONS=--max_old_space_size=4096
npm run build
pkg .
cp deepphe-visualizer-macos ~/dev/dphe-installer/viz-output/DeepPhe-Viz/DeepPheVizApi2
cp deepphe-visualizer-win.exe ~/dev/dphe-installer/viz-output/DeepPhe-Viz/DeepPheVizApi2.exe
