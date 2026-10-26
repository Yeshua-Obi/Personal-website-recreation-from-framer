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
  ]), [complete, { ...complete, slug: "hidden-from-home", showOnHome: false }]);
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

test("homepage capacity reserves projects for Work and unlocks twelve only at eighteen", async () => {
  const {selectHomepageGrid, selectHeroProjects, homepageGridLimit} = await import('../src/lib/projects');
  const cases: Record<number,number> = {0:0,1:0,2:0,3:0,4:0,5:0,6:3,7:3,8:3,9:6,10:6,11:6,12:9,13:9,14:9,15:9,16:9,17:9,18:12,19:12,24:12};
  for (const [size,expected] of Object.entries(cases)) {
    const count=Number(size);
    const input=Array.from({length:count},(_,index)=>({...complete,slug:`project-${index}`,sortOrder:count-index}));
    assert.equal(homepageGridLimit(count),expected);
    assert.equal(selectHomepageGrid(input).length,expected);
    assert.equal(selectHeroProjects(input).length,Math.min(6,count));
    if(count) assert.equal(selectHeroProjects(input)[0].slug,`project-${count-1}`);
  }
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
 assert.deepEqual(selectHomepageGrid(projects).map(p=>p.slug),['ranked-1','ranked-2','ranked-3']);
 assert.equal(projectsInCategory(projects,'brand-systems')[4].slug,'ranked-0');
});


test('manual choices lead independently, backfill automatically and retain priority within both groups',async()=>{
 const {selectHomepageGrid,selectHeroProjects}=await import('../src/lib/projects');
 const input=Array.from({length:18},(_,i)=>({...complete,slug:`selected-${i}`,sortOrder:i,showInCarousel:i===3||i===15,showInHomeGrid:i===2||i===16}));
 assert.deepEqual(selectHeroProjects(input).map(p=>p.slug),['selected-3','selected-15','selected-0','selected-1','selected-2','selected-4']);
 assert.deepEqual(selectHomepageGrid(input).slice(0,5).map(p=>p.slug),['selected-2','selected-16','selected-0','selected-1','selected-3']);
 assert.equal(selectHomepageGrid(input).length,12);
 const automatic=input.map(p=>({...p,showInCarousel:false,showInHomeGrid:false}));
 assert.deepEqual(selectHeroProjects(automatic).map(p=>p.slug),automatic.slice(0,6).map(p=>p.slug));
 assert.deepEqual(selectHomepageGrid(automatic).map(p=>p.slug),automatic.slice(0,12).map(p=>p.slug));
 const allChosen=input.map(p=>({...p,showInCarousel:true,showInHomeGrid:true}));
 assert.deepEqual(selectHeroProjects(allChosen).map(p=>p.slug),automatic.slice(0,6).map(p=>p.slug));
 assert.equal(new Set(selectHomepageGrid(input).map(p=>p.slug)).size,12);
 const invalid=[...input,{...complete,slug:'draft-choice',status:'draft' as const,showInCarousel:true,showInHomeGrid:true}];
 assert.deepEqual(selectHeroProjects(invalid),selectHeroProjects(input));
 assert.deepEqual(selectHomepageGrid(invalid),selectHomepageGrid(input));
});
