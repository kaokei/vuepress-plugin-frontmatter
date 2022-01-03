const fs = require("fs");
const matter = require("gray-matter"); // FrontMatter解析器 https://github.com/jonschlinkert/gray-matter

const setFrontmatter = require("vuepress-theme-vdoing/node_utils/setFrontmatter");
const readFileList = require("vuepress-theme-vdoing/node_utils/modules/readFileList");

module.exports = (options = {}, context) => {
  return {
    async extendPageData($page) {
      if ($page.relativePath.indexOf("_posts") === 0) {
        if ($page.frontmatter.showSidebar !== true) {
          $page.frontmatter.showSidebar = false;
        }
      }
    },
    extendCli(cli) {
      cli.command("fmt", "给markdown文件增加frontmatter").action(() => {
        const { sourceDir, themeConfig } = context;
        // 生成frontmatter头部信息
        setFrontmatter(sourceDir, themeConfig);

        // 以下代码是检查是否有重复的permalink
        const files = readFileList(sourceDir); // 读取所有md文件数据

        // 记录所有的链接
        const metaDataMap = {};
        // 重复的链接
        const repeatedArr = [];

        files.forEach((file) => {
          let dataStr = fs.readFileSync(file.filePath, "utf8"); // 读取每个md文件内容

          // fileMatterObj => {content:'剔除frontmatter后的文件内容字符串', data:{<frontmatter对象>}, ...}
          const fileMatterObj = matter(dataStr, {});

          const matterData = fileMatterObj.data;

          if (matterData.permalink) {
            const link = matterData.permalink;
            if (metaDataMap[link]) {
              // 已经存在则说明重复了
              repeatedArr.push(link);
            } else {
              // 没有记录则第一次记录下来
              metaDataMap[link] = file.filePath;
            }
          }
        });

        if (repeatedArr.length) {
          console.error("发现重复的permalink => ", repeatedArr);
        }
      });
    },
  };
};
