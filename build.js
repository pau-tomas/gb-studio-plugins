import {
  existsSync,
  cpSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
} from "fs";
import { join, dirname, relative, resolve } from "path";
import { sync } from "glob";
import { execSync } from "child_process";

const __dirname = import.meta.dirname;

// Paths to relevant directories and files
const pluginsDir = join(__dirname, "plugins");
const outputDir = join(__dirname, "dist");
const repositoryJsonPath = join(__dirname, "repository.json");
const outputRepositoryJsonPath = join(outputDir, "repository.json");
const CNAMEPath = join(__dirname, "CNAME");
const outputCNAMEPath = join(outputDir, "CNAME");

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir);
}

// Read the base repository.json
const repository = JSON.parse(readFileSync(repositoryJsonPath, "utf-8"));

// Initialize the plugins array in repository.json if it doesn't exist
if (!repository.plugins) {
  repository.plugins = [];
}

// Collect all plugin.json files
const pluginFolders = sync(join(pluginsDir, "**/plugin.json"));

// Process each plugin folder: merge JSON and zip the contents
pluginFolders.forEach((pluginJsonPath) => {
  const pluginDir = dirname(pluginJsonPath);
  const pluginId = relative(pluginsDir, pluginDir);
  const pluginOutputPath = join(outputDir, pluginId);
  const zipFilePath = join(pluginOutputPath, `plugin.zip`);
  const readmePath = join(pluginDir, `README.md`);

  const folder = dirname(zipFilePath);

  // Read and parse the plugin.json
  const pluginData = JSON.parse(readFileSync(pluginJsonPath, "utf-8"));

  // Add the plugin's folder name as an `id`
  pluginData.id = pluginId;
  pluginData.filename = relative(outputDir, zipFilePath);

  if (pluginData.images && Array.isArray(pluginData.images)) {
    for (const image of pluginData.images) {
      const fromPath = join(pluginDir, image);
      const toPath = join(pluginOutputPath, image);
      if (
        isFileWithinFolder(fromPath, pluginDir) &&
        isFileWithinFolder(toPath, pluginOutputPath)
      ) {
        cpSync(fromPath, toPath);
      }
    }
  }

  // Add this plugin's data to the repository plugins array
  repository.plugins.push(pluginData);

  mkdirSync(folder, { recursive: true });

  // Zip the plugin folder if the zip file doesn't exist or the plugin contents have changed
  if (!existsSync(zipFilePath) || isPluginModified(pluginDir, zipFilePath)) {
    console.log(`Zipping ${pluginId}...`);
    zipPluginFolder(pluginDir, zipFilePath);
  } else {
    console.log(`${pluginId} is already up to date.`);
  }
});

// Write the final merged repository.json to the output directory
writeFileSync(outputRepositoryJsonPath, JSON.stringify(repository, null, 2));

// Copy CName
copyFileSync(CNAMEPath, outputCNAMEPath);

console.log(
  "repository.json has been successfully created in the output folder."
);

// Utility function to zip a plugin folder
function zipPluginFolder(pluginDir, zipFilePath) {
  try {
    // Run the zip command from inside the plugin folder
    execSync(`zip -r "${zipFilePath}" .`, { cwd: pluginDir, stdio: "inherit" });
    console.log(`Successfully zipped ${pluginDir}`);
  } catch (err) {
    console.error(`Failed to zip ${pluginDir}:`, err);
  }
}

// Utility function to check if any file in the plugin folder is newer than the zip file
function isPluginModified(pluginDir, zipFilePath) {
  try {
    const result = execSync(`find "${pluginDir}" -newer "${zipFilePath}"`, {
      encoding: "utf-8",
    });
    return result.trim().length > 0; // If there's output, the plugin is modified
  } catch (err) {
    return true; // If something goes wrong, assume we need to zip
  }
}

function isFileWithinFolder(filePath, folderPath) {
  const absoluteParentPath = resolve(folderPath);
  const absoluteChildPath = resolve(filePath);

  if (absoluteParentPath === absoluteChildPath) {
    return true;
  }
  return absoluteChildPath.startsWith(absoluteParentPath);
}
