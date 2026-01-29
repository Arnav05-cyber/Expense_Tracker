import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { StyleSheet, Pressable } from "react-native";
import CustomText from "./CustomText";
import CustomBox from "./Box";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const CustomModal = ({ isOpen, onClose, message }: CustomModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <CustomText style={styles.headerText}>Notice</CustomText>
          {/* Closing via X is optional, but user said 'no save/cancel' */}
          {/* We will leave it out to force the main flow if desired, or keep it for UX */}
          {/* User said "should not have a save or cancel option". Usually X is fine. */}
          {/* But I'll stick to a clean "Continue" flow. */}
        </ModalHeader>
        <ModalBody>
          <CustomText style={styles.messageText}>{message}</CustomText>
        </ModalBody>
        <ModalFooter>
          <Pressable onPress={onClose} style={{ width: "100%" }}>
            <CustomBox style={buttonBox}>
              <CustomText style={styles.buttonText}>Continue</CustomText>
            </CustomBox>
          </Pressable>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  headerText: {
    fontSize: 20,
    marginBottom: 10,
  },
  messageText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonText: {
    textAlign: "center",
    color: "black",
    fontWeight: "bold",
  },
});

const buttonBox = {
  mainBox: {
    backgroundColor: "white",
    borderColor: "black",
    borderRadius: 10,
    borderWidth: 2,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  shadowBox: {
    backgroundColor: "black",
    borderRadius: 10,
  },
};
