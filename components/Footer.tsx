import { COURSE_CREDITS } from "@/lib/config";
import { AuthAction } from "./AuthAction";

export default function Footer() {
  return (
    <footer>
      <p>
        <AuthAction /> | {COURSE_CREDITS}
      </p>
    </footer>
  );
}
