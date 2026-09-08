import Hero from "../sections/institute/Hero";
import CourseCard from "../sections/institute/CourseCard";
import Outcomes from "../sections/institute/Outcomes";
import Syllabus from "../sections/institute/Syllabus";
import Audience from "../sections/institute/Audience";
import Batches from "../sections/institute/Batches";
import Instructor from "../sections/institute/Instructor";
import Faq from "../sections/institute/Faq";
import Enrol from "../sections/institute/Enrol";

export default function InstitutePage() {
  return (
    <>
      <Hero />
      <CourseCard />
      <Outcomes />
      <Syllabus />
      <Audience />
      <Batches />
      <Instructor />
      <Faq />
      <Enrol />
    </>
  );
}
