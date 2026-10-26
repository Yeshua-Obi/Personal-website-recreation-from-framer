import { test } from "node:test";
import assert from "node:assert/strict";
import { getPublishedProjects, selectPublishedProjects, selectHomepageProjects, projectSummary, type Project } from "../src/lib/projects";
import { getSiteUrl } from "../src/lib/site";

const complete: Project = {
  slug: "example-case-study",
  title: "Test case study",
  category: "Test fixture",
  description: "Only used by the automated tests.",
  status: "published",
  content: ["A complete test case study."],
};

test("only published projects with real page content reach the gallery and routes", () => {
  const result = selectPublishedProjects([
    { ...complete, slug: "still-a-draft", status: "draft" },
    { ...complete, slug: "no-case-study", content: [] },
    { ...complete, slug: "blank-case-study", content: ["   "] },
    { ...complete, slug: "no-description", description: " " },
    { ...complete, slug: "no-title", title: " " },
    complete,
  ]);
  assert.deepEqual(result, [complete]);
  assert.deepEqual(selectHomepageProjects([
    complete,
    { ...complete, slug: "hidden-from-home", showOnHome: false },
    { ...complete, slug: "draft-on-home", status: "draft", showOnHome: true },
  ]), [complete]);
});

test("unroutable slugs and duplicate channels do not become project links", () => {
  const result = selectPublishedProjects([
    { ...complete, slug: "../../private" },
    { ...complete, slug: "has space" },
    complete,
    { ...complete, title: "Duplicate" },
  ]);
  assert.deepEqual(result, [complete]);
});

test("the imported portfolio includes 11 complete case studies and rejects PNG sources as video", () => {
  const published = getPublishedProjects();
  assert.equal(published.length, 11);
  assert.equal(published.filter(project => project.video).length, 9);
  for (const project of published) {
    assert.ok(project.sourceUrl?.startsWith("https://yeshuaobi.framer.website/portfolio/"));
    if (project.video) assert.ok(new URL(project.video).pathname.endsWith(".mp4"));
    assert.ok(projectSummary(project).length <= 160);
  }
  assert.equal(published.find(project => project.slug === "nibss")?.video, null);
  assert.equal(published.find(project => project.slug === "saka")?.video, null);
});

test("a missing deployment origin does not invent a canonical URL", () => {
  assert.equal(getSiteUrl(""), undefined);
  assert.equal(getSiteUrl("https://portfolio.test"), "https://portfolio.test");
});

test("deployment origin rejects paths, credentials, and development placeholders", () => {
  for (const url of ["http://portfolio.test", "https://localhost", "https://your-domain.example", "https://portfolio.test/projects", "https://name:secret@portfolio.test", "https://portfolio.test?query=1"]) {
    assert.throws(() => getSiteUrl(url));
  }
});

test("homepage grid contains complete rows up to nine and hero follows the same priority", async () => {
  const {selectHomepageGrid, selectHeroProjects} = await import('../src/lib/projects');
  for (let count=0;count<=15;count++) {
    const input=Array.from({length:count},(_,index)=>({...complete,slug:`project-${index}`,sortOrder:count-index}));
    const grid=selectHomepageGrid(input);
    assert.equal(grid.length, Math.min(9,Math.floor(count/3)*3));
    assert.equal(selectHeroProjects(input).length,Math.min(5,count));
    if(count) assert.equal(selectHeroProjects(input)[0].slug,`project-${count-1}`);
  }
  const input=Array.from({length:8},(_,i)=>({...complete,slug:`case-${i}`,sortOrder:i,showOnHome:i!==0}));
  assert.equal(selectHomepageGrid(input).length,6);
  assert.equal(selectHeroProjects(input)[0].slug,'case-1');
});

test("brief suggestions fill only missing fields and never infer credits or dates", async () => {
  const {suggestMissingDetails}=await import('../cms/suggestions');
  const result=suggestMissingDetails({brief:'An AI automation workflow for a new website.',description:'Approved summary',categories:['brand-systems']});
  assert.equal(result.description,undefined);
  assert.equal(result.categories,undefined);
  assert.equal(result.date,undefined);
  assert.equal(result.credit,undefined);
  assert.equal(result.category,'Digital products / AI workflows');
  assert.deepEqual(suggestMissingDetails({}),{});
});

test('drag ranking takes priority over legacy numbers in homepage and categories', async()=>{
 const {selectHeroProjects,selectHomepageGrid}=await import('../src/lib/projects');
 const {projectsInCategory}=await import('../src/lib/project-categories');
 const projects=Array.from({length:6},(_,i)=>({...complete,slug:`ranked-${i}`,sortOrder:i,orderRank:`0|${i===0?'e':i===5?'f':String.fromCharCode(96+i)}:`,categories:['brand-systems' as const]}));
 assert.deepEqual(selectPublishedProjects(projects).map(p=>p.slug),['ranked-1','ranked-2','ranked-3','ranked-4','ranked-0','ranked-5']);
 assert.equal(selectHeroProjects(projects)[4].slug,'ranked-0');
 assert.equal(selectHomepageGrid(projects)[4].slug,'ranked-0');
 assert.equal(projectsInCategory(projects,'brand-systems')[4].slug,'ranked-0');
});
